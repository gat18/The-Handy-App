import React, { Component } from "react";
import Fade from "react-reveal";

class About extends Component {
  render() {
    if (!this.props.data) return null;

    const profilepic = "images/" + this.props.data.image;
    const bio = this.props.data.bio;

    return (
      <section id="about">
        <Fade duration={1000}>
          <div className="row">
            <div className="three columns">
              <img
                className="profile-pic"
                src={profilepic}
                alt="Gordon's Profile Pic"
              />
            </div>
            <div className="nine columns main-col">
              <h2>About Me</h2>
                  <p>My name is Gordon Thompson and designing this Hand Gesutre-based keyboard is my final year project. 
                  I also would like to mention the guidance and support my supervisor, Sarim Baig, has provided throughout this project.
                  </p>
              <div className="row">
                <div className="columns extra-details">
                  <h2>About the Project</h2>
                <p>{bio}</p>
                </div>
                
              </div>
            </div>
          </div>
        </Fade>
      </section>
    );
  }
}

export default About;
