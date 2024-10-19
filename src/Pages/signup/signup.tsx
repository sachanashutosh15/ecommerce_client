import React, { ChangeEvent } from "react";
import "./signup.scss"
import { Form } from "react-bootstrap";
import { Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

function SignUp() {

  const serverBaseUrl = process.env.REACT_APP_BASE_URL || process.env.SERVER_URL;

  const navigate = useNavigate();

  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    address: "",
    password: ""
  })

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log(formData);
    const userInfo = { ...formData };
    if (!(userInfo.name && userInfo.email && userInfo.address && userInfo.password)) {
      window.alert("Please fill all the fields!!!");
      return;
    }
    fetch(`${serverBaseUrl}/auth/signup`, {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify(userInfo)
    })
      .then(res => {
        res.json()
          .then((response) => {
            console.log(response);
            if (response.data) {
              window.alert("Successfully created the user, you can now login");
              navigate('/login');
            }
          }).catch(error => {
            console.log("Error => ", error.message);
          })
      }).catch((error) => {
        console.log(error);
        window.alert("Client app is not able to access server.")
      })
  }

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prevData) => {
      return {
        ...prevData,
        [name]: value
      }
    })
  }

  return (
    <div className="signup-page">
      <div className="login-card">
        <Form className="form-container" onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="formBasicName">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter name"
              onChange={handleChange}
              name="name"
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formBasicEmail">
            <Form.Label>Email address</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter email"
              onChange={handleChange}
              name="email"
            />
            <Form.Text className="text-muted">
              We'll never share your email with anyone else.
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3" controlId="formBasicAddress">
            <Form.Label>Address</Form.Label>
            <Form.Control
              type="address"
              placeholder="Enter Address"
              onChange={handleChange}
              name="address"
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formBasicPassword">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Choose Password"
              onChange={handleChange}
              name="password"
            />
          </Form.Group>

          {/* <Form.Group className="mb-3" controlId="formBasicCheckbox">
            <Form.Check type="checkbox" label="Check me out" />
          </Form.Group> */}

          <Button variant="primary" type="submit">
            Submit
          </Button>
        </Form>
        <span>Already Registered?</span>
        <Link to="/login">
          <label className="signup-button" >Login</label>
        </Link>
      </div>
    </div>
  )
}

export default SignUp;