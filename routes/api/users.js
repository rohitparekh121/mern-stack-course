const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const gravatar = require('gravatar');
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const config = require('config');
const User = require('../../models/User') ; 

// @route   POST api/users
// @desc    Register User
// @access  Public 

router.post('/', [
    check('name',"Name is required").not().isEmpty(),
    check('email',"Please include valid email.").isEmail(),
    check('password','please enter a password with a 6 or more charachters').isLength({ min: 6 })
], async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {

        //  See if user exists
        let user = await User.findOne({ email });

        if(user) {
            return res.status(400).json({ errors: [{ msg: "User already exists" }] })
        }

        // get users gravatars
        const avatar = gravatar.url(email, {
            s: '200',
            r: 'pg',
            d: 'mm'
        })

        user = new User({
            name,
            email,
            avatar,
            password
        });

        // Encrypt password
        const salt = await bcrypt.genSalt(10);

        user.password = await bcrypt.hash(password, salt);
        await user.save();

        // Return Json web token

        const payload = {
            user: {
                id: user.id
            }
        }

        jwt.sign(
            payload, 
            config.get('jwtSecrete'),
            { expiresIn: 360000 },
            (err, token) => {
                if(err) throw err;
                res.json({ token });
            }
        );

    } catch(error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }

    
})

module.exports = router;