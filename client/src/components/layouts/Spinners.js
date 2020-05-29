import React, { Fragment } from "react";
import spinner from "./spinner.gif";

export default () => (
  <Fragment>
    <img
      src={spinner}
      style={{
        width: "320px",
        height: "300px",
        display: "block",
        margin: "auto",
      }}
      alt="Loading..."
    />
  </Fragment>
);
