import React, { Component } from "react";
import Slide from "react-reveal";
import Fade from "react-reveal";
import { Link } from "react-router-dom";

class Userguide extends Component {
  getRandomColor() {
    let letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  render() {
    if (!this.props.data) return null;
    
    const model = this.props.data.model;
    const motivation = this.props.data.motivation.map(function (motivation) {
      return (
          <p>{motivation.description}</p>
      );
    });
    const guide = this.props.data.instructions.map(function (guide) {
      return (
        <div key={guide.title}>
          <h3>{guide.title}</h3>
          <p>{guide.description}</p>
        </div>
      );
    });
    const tips = this.props.data.tips.map(function (tips) {
      return (
        <div key={tips.title}>
          <h3>{tips.title}</h3>
          <p>{tips.description}</p>
        </div>
      );
    });
    const models = this.props.data.models.map(function (models) {
      return (
        <div key={models.title}>
          <h3>{models.title}</h3>
          <p>{models.description}</p>
        </div>
      );
    });

    return (
      <section id="userguide">
      <Slide left duration={1300}>
          <div className="row work">
            <div className="three columns header-col">
              <h1>
                <span>User Guide</span>
              </h1>
            </div>

            <div className="nine columns main-col">{guide}
            <Fade leftduration={1300}>
              <ul className="social" >
                <Link to="/model">
                  <a href={model} className="button btn start2-btn" >
                    <i className="fa fa-thumbs-o-up"></i>Get Started
                  </a>
                </Link>
              </ul>
            </Fade>
            </div>
          </div>
        </Slide>
        <Slide left duration={1300}>
          <div className="row work">
            <div className="three columns header-col">
              <h1>
                <span>Model Choice</span>
              </h1>
            </div>

            <div className="nine columns main-col">{models}</div>
          </div>
        </Slide>
        <Slide left duration={1300}>
          <div className="row work">
            <div className="three columns header-col">
              <h1>
                <span>Tips & Tricks</span>
              </h1>
            </div>

            <div className="nine columns main-col">{tips}</div>
          </div>
        </Slide>
        <Slide left duration={1300}>
          <div className="row motivation">
            <div className="three columns header-col">
              <h1>
                <span>Motivation</span>
              </h1>
            </div>

            <div className="nine columns main-col">
              <div className="row item">
                <div className="twelve columns">{motivation}</div>
              </div>
            </div>
          </div>
        </Slide>

      
      </section>
    );
  }
}

export default Userguide;
