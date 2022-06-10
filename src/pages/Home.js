import React, { Component } from "react";
import ReactGA from "react-ga";
import $ from "jquery";
import "./Home.css";
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import About from "../Components/About";
import Userguide from "../Components/Userguide";

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      foo: "bar",
      resumeData: {}
    };

    ReactGA.initialize("UA-110570651-1");
    ReactGA.pageview(window.location.pathname);
  }

  getResumeData() {
    $.ajax({
      url: "./resumeData.json",
      dataType: "json",
      cache: false,
      success: function(data) {
        this.setState({ resumeData: data });
      }.bind(this),
      error: function(xhr, status, err) {
        console.log(err);
        alert(err);
      }
    });
  }

  componentDidMount() {
    this.getResumeData();
  }

  render() {
    return (
      <div className="Home">
        <Header data={this.state.resumeData.main} />
        <About data={this.state.resumeData.main} />
        <Userguide data={this.state.resumeData.userguide} />
        <Footer data={this.state.resumeData.main} />
      </div>
    );
  }
}

export default Home;
