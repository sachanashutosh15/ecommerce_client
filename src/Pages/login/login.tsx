import React, { ChangeEvent } from "react";
import "./login.scss"
import { Form } from "react-bootstrap";
import Button from "react-bootstrap/esm/Button";
import { Link } from "react-router-dom";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../contexts/userContext";

function Login() {

  const serverBaseUrl = process.env.REACT_APP_BASE_URL;

  const { updateUserDetails } = useUser();

  const navigate = useNavigate();

  const [loginFormData, setFormData] = React.useState({
    email: "",
    password: ""
  })

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prevData) => {
      return {
        ...prevData,
        [name]: value
      }
    })
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    try {
      event.preventDefault();
      console.log(loginFormData);
      const loginInfo = { ...loginFormData };
      if (!loginInfo.email || !loginInfo.password) {
        window.alert("Please fill the required fields");
        return;
      }
      let res: any;
      try {
        res = await fetch(`${serverBaseUrl}/auth/signin`, {
          method: "POST",
          headers: {
            "content-type": "application/json"
          },
          body: JSON.stringify(loginInfo),
        })
      } catch (error: any) {
        throw {
          message: "Client app is not able to access server."
        };
      }
      const response = await res.json()
      if (response.data) {
        console.log(response.data);
        updateUserDetails(response.data.userInfo);
        const token = response.data.token;
        const cookieSetRes = Cookies.set("token", token, { expires: 7 });
        console.log(cookieSetRes);
        navigate("/dashBoard");
      } else {
        window.alert("Please Check your credentials");
      }
    } catch (error) {
      console.log(error);
    }
  }

  return (
    // <userContext.Provider value={userDetails}>
    <div className="login-page">
      <div className="login-card">
        <Form className="form-container" onSubmit={handleSubmit}>
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

          <Form.Group className="mb-3" controlId="formBasicPassword">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Password"
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
        <span>New user?</span>
        <Link to="/signup">
          <label className="signup-button" >Sign Up</label>
        </Link>
      </div>
    </div>
    // </userContext.Provider>
  )
}

export default Login;