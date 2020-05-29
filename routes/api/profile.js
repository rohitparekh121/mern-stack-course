const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const Profile = require('../../models/Profile');
const User = require('../../models/User');
const { check, validationResult } = require('express-validator');
// @route   GET api/profile/me
// @desc    Get Current user profile 
// @access  Private

router.get('/me', auth, async (req, res) => {

    try {
        const profile = await Profile.findOne({ user: req.user.id }).populate('user', ['name', 'avatar']);

        if (!profile) {
            return res.status(400).json({ msg: 'There is no profile for this user' });
        }

        res.json(profile);

    } catch (error) {
        console.log(error.message);
        res.status(500).send('Server Error');
    }

})

// @route   Post api/profile
// @desc    Create and update user profile 
// @access  Private

router.post('/', [
    auth,
    [
        check('status', 'Status is required ').not().isEmpty(),
        check('skills', 'Skill is required').not().isEmpty(),
    ]
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const {
        company,
        website,
        location,
        bio,
        status,
        githubusername,
        skills,
        youtube,
        facebook,
        twitter,
        instagram,
        linkedin
    } = req.body;

    // Build profile object
    const profileFields = {};

    profileFields.user = req.user.id;
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;
    if (githubusername) profileFields.githubusername = githubusername;

    if (skills) {
        profileFields.skills = skills.split(',').map(skill => skill.trim());
    }

    // Build profile social Objects
    profileFields.social = {}
    if (youtube) profileFields.social.youtube = youtube;
    if (twitter) profileFields.social.twitter = twitter;
    if (facebook) profileFields.social.facebook = facebook;
    if (linkedin) profileFields.social.linkedin = linkedin;
    if (instagram) profileFields.social.instagram = instagram;

    try {
        let profile = await Profile.findOne({ user: req.user.id });

        if (profile) {
            // Update
            profile = await Profile.findOneAndUpdate(
                { user: req.user.id },
                { $set: profileFields },
                { new: true }
            );
            return res.json(profile);
        }

        // Create
        profile = new Profile(profileFields);

        await profile.save();
        res.json(profile);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }

});

// @route   Get api/profile
// @desc    Get all profile 
// @access  Public

router.get('/', async (req, res) => {
    try {
        const profiles = await Profile.find().populate('user', ['name', 'avatar']);
        res.json(profiles);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
})

// @route   Get api/profile/user/user_id
// @desc    Get profile by user id
// @access  Public

router.get('/user/:user_id', async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.params.user_id }).populate('user', ['name', 'avatar']);

        if (!profile) return res.status(400).json({ msg: 'Profile not found' });

        res.json(profile);
    } catch (error) {
        console.error(error.message);
        if (error.kind == 'ObjectId') {
            return res.status(400).send('Profile not found');
        }
        res.status(500).send('Server Error');
    }
})


// @route   Delete api/profile/user/user_id
// @desc    Delete profile user & posts
// @access  Private

router.delete('/', auth, async (req, res) => {
    try {
        // @todo - remove users posts

        // Remove Profile
        await Profile.findOneAndRemove({ user: req.user.id });
        // Remove User
        await User.findOneAndRemove({ _id: req.user.id });

        res.json({ msg: 'User deleted' });
    } catch (error) {
        console.error(error.message);
        if (error.kind == 'ObjectId') {
            return res.status(400).send('Profile not found');
        }
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/profile/user/user_id
// @desc    Add Profile experience
// @access  Private

router.put('/experience', [auth, [
    check('title', 'Title is required').not().isEmpty(),
    check('company', 'Company is required').not().isEmpty(),
    check('from', 'From date is required').not().isEmpty(),
]
],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const {
            title,
            company,
            location,
            from,
            to,
            current,
            description
        } = req.body;

        const newExp = {
            title,
            company,
            location,
            from,
            to,
            current,
            description
        };

        try {
            const profile = await Profile.findOne({ user: req.user.id });

            profile.experiences.unshift(newExp);

            await profile.save();

            res.json(profile);

        } catch (error) {
            console.log(error.message);
            res.status(500).send('Server Error');
        }
    });


// @route   DEELTE api/profile/user/Profile/:exp_id
// @desc    Delete Experience from profile
// @access  Private

router.delete('/experience/:exp_id', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id });

        // Get remove index
        const removeIndex = profile.experiences.map(item => item.id).indexOf(req.params.exp_id);

        profile.experiences.splice(removeIndex, 1);
        await profile.save();
        res.json(profile);
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Server Error');
    }
})



// @route   PUT api/profile/user/user_id
// @desc    Add Profile Education
// @access  Private

router.put('/education', [auth, [
    check('school', 'School is required').not().isEmpty(),
    check('degree', 'Degree is required').not().isEmpty(),
    check('fieldofstudy', 'Field of study date is required').not().isEmpty(),
    check('from', 'From date is required').not().isEmpty(),
]
],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const {
            school,
            degree,
            fieldofstudy,
            from,
            to,
            current,
            description
        } = req.body;

        const newEdu = {
            school,
            degree,
            fieldofstudy,
            from,
            to,
            current,
            description
        };

        try {
            const profile = await Profile.findOne({ user: req.user.id });

            profile.education.unshift(newEdu);

            await profile.save();

            res.json(profile);

        } catch (error) {
            console.log(error.message);
            res.status(500).send('Server Error');
        }
    });


// @route   DEELTE api/profile/user/Profile/:edu_id
// @desc    Delete Education from profile
// @access  Private

router.delete('/education/:edu_id', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id });

        // Get remove index
        const removeIndex = profile.education.map(item => item.id).indexOf(req.params.edu_id);

        profile.education.splice(removeIndex, 1);
        await profile.save();
        res.json(profile);
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Server Error');
    }
})

module.exports = router;