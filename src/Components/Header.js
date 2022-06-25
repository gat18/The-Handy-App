import React, { Component } from "react";
import ParticlesBg from "particles-bg";
import Fade from "react-reveal";
import { NavLink } from "react-router-dom";

class Header extends Component {
  render() {
    if (!this.props.data) return null;

    const report = this.props.data.report;
    const demo = this.props.data.demo;
    const model = this.props.data.model;
    const name = this.props.data.name;
    const description = this.props.data.description;

    return (
      <header id="home">
        <ParticlesBg num={700} type="lines" bg={true} />

        <nav id="nav-wrap">
          <a className="mobile-btn" href="#nav-wrap" title="Show navigation">
            Show navigation
          </a>
          <a className="mobile-btn" href="#home" title="Hide navigation">
            Hide navigation
          </a>

          <ul id="nav" className="nav">
            <li className="current">
              <a className="smoothscroll" href="#home">
                Home
              </a>
            </li>

            <li>
              <a className="smoothscroll" href="#about">
                About
              </a>
            </li>

            <li>
              <a className="smoothscroll" href="#userguide">
                User Guide
              </a>
            </li>

            <li >
              <NavLink to="/model">Start</NavLink>
            </li>
          </ul>
        </nav>

        <div className="row banner">
          <div className="banner-text">
            <Fade bottom>
              <h1 className="responsive-headline">{name}</h1>
            </Fade>
            <Fade bottom duration={1200}>
              <h3>{description}.</h3>
            </Fade>
            <hr />
            <Fade bottom duration={2000}>
              <ul className="social">
                <a href={report} className="button btn project-btn">
                  <i className="fa fa-book"></i>Report
                </a>
                <a href={demo} className="button btn github-btn">
                  <i className="fa fa-video-camera "></i>Demo
                </a>
              </ul>
            </Fade>
            <Fade bottom duration={2000}>
              <ul className="social">
              <NavLink to="/model">
                <a href={model} className="button btn start-btn">
                  <i className="fa fa-thumbs-o-up"></i>Get Started
                </a>
                </NavLink>
              </ul>
            </Fade>
          </div>
        </div>
        

        <p className="scrolldown">
          <a className="smoothscroll" href="#about">
            <i className="icon-down-circle"></i>
          </a>
        </p>
      </header>
    );
  }
}

export default Header;
