import Cookies from "js-cookie";
import React, { ReactNode, useState } from "react";
import "./dashBoard.scss"
import { useNavigate } from "react-router-dom";
import Navbar from 'react-bootstrap/Navbar';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';

const serverBaseUrl = process.env.REACT_APP_BASE_URL || process.env.SERVER_URL;

function DashBoard() {
  const [userInfo, setUserInfo] = React.useState<any>(null);

  const [isLoggedIn, setIsLoggedIn] = React.useState(true);

  const [productsList, setProductsList] = React.useState<any>([]);

  const [cartInfo, setCartInfo] = React.useState<any>({});

  const [sideMenu, toggleSideMenu] = React.useState({
    cartMenu: false,
    myOrdersMenu: false
  });

  const [myOrderPopup, setMyOrderPopup] = React.useState({
    isOpen: false,
    data: null
  });

  const navigate = useNavigate();

  React.useEffect(() => {
    const storedToken = Cookies.get("token");
    if (!storedToken) {
      navigate('/login')
    } else {
      fetchProductsList();
      fetchUserDetails();
    }
  }, [isLoggedIn]);

  const handleLogout = () => {
    Cookies.remove("token");
    const storedToken = Cookies.get("token");
    if (!storedToken) {
      setIsLoggedIn(false);
      window.alert("Logged out")
    }
  }

  const fetchProductsList = async () => {
    try {
      const storedToken = Cookies.get('token');
      let response: any;
      try {
        response = await fetch(`${serverBaseUrl}/inventory/getAll`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${storedToken}`
          }
        })
      } catch (error: any) {
        throw error.message
      }
      const apiResponse: any = await response.json();
      let itemsList = apiResponse.data ? apiResponse.data : null;
      if (itemsList) {
        itemsList = itemsList.filter((itemDetails: any) => itemDetails.quantity > 0);
        console.log(itemsList);
        setProductsList(itemsList);
      } else {
        window.alert("Not able to fetch product list");
        return;
      }
    } catch (error: any) {
      console.log(error);
      window.alert(error.message);
    }
  }

  const fetchUserDetails = async () => {
    try {
      const storedToken = Cookies.get('token');
      let response: any;
      try {
        response = await fetch(`${serverBaseUrl}/auth/getUserDetails`, {
          method: 'GET',
          headers: {
            "Authorization": `Bearer ${storedToken}`
          }
        })
      } catch (error: any) {
        throw error.message;
      }
      const apiResponse = await response.json();
      const userDetails = apiResponse.data;
      if (userDetails) {
        setUserInfo({
          name: userDetails.username,
          email: userDetails.email
        })
      } else {
        window.alert("Not able to fetch user details");
      }
    } catch (error: any) {
      console.log(error)
      window.alert(error.message);
    }
  }

  const addToCart = (product: any) => {
    if (cartInfo.hasOwnProperty(product._id)) {
      window.alert("This item is already in cart");
      return;
    }
    setCartInfo((previousInfo: any[]) => {
      return {
        ...previousInfo,
        [product._id]: {
          ...product,
          requestedQuantity: 1
        }
      }
    })
  }

  const toggleCartMenu = () => {
    toggleSideMenu((prevState) => {
      return {
        ...prevState,
        cartMenu: !sideMenu.cartMenu
      }
    })
  }

  const toggleMyOrdersMenu = () => {
    toggleSideMenu((prevState) => {
      return {
        ...prevState,
        myOrdersMenu: !sideMenu.myOrdersMenu
      }
    })
  }

  return (
    <>
      <MyOrderPopUp popupInfo={myOrderPopup}></MyOrderPopUp>
      <SideMenu menuStatus={sideMenu.cartMenu}>
        <CartMenuContent cartInfo={cartInfo} setCartInfo={setCartInfo} userInfo={userInfo} />
      </SideMenu>
      <SideMenu menuStatus={sideMenu.myOrdersMenu}>
        <MyOrdersMenuContent
          menuStatus={sideMenu.myOrdersMenu}
          setMyOrderPopup={setMyOrderPopup}
        />
      </SideMenu>
      {
        sideMenu.cartMenu || sideMenu.myOrdersMenu ?
          <div
            className="overlay"
            onClick={() => {
              toggleSideMenu({
                cartMenu: false,
                myOrdersMenu: false,
              })
            }}
          >
          </div> : ""
      }
      {
        myOrderPopup.isOpen ?
          <div
            className="popup-overlay"
            onClick={() => {
              setMyOrderPopup({
                ...myOrderPopup,
                isOpen: false,
              })
            }}
          >
          </div> : ""
      }
      <Navbar className="bg-body-tertiary">
        <Container>
          <Navbar.Brand>DashBoard</Navbar.Brand>
          <Navbar.Collapse className="justify-content-end">
            <Navbar.Text>
              Signed in as: {userInfo?.name}
            </Navbar.Text>
          </Navbar.Collapse>
        </Container>
        <span
          className="cart-label my-orders-button"
          onClick={toggleMyOrdersMenu}
        >My Orders</span>
        <span className="cart-label" onClick={toggleCartMenu}>
          {Object.keys(cartInfo).length > 0 ?
            <div className="label-circle">{Object.keys(cartInfo).length}</div>
            : <></>
          }
          <label>Cart</label>
        </span>
        <Button onClick={handleLogout} className="logout-button">Logout</Button>
      </Navbar>
      <div className="products-cards-container">
        {productsList.map((product: any, idx: number) =>
          <ProductCard
            key={idx}
            productInfo={product}
            functions={{ addToCart: addToCart }}
          />)}
      </div>
    </>
  )
}

function ProductCard(props: any) {
  const data = props.productInfo;
  const { addToCart } = props.functions;
  return (
    <div className="product-card">
      <img className="product-image" src={`${data.image}`} alt='Text'></img>
      <div className="text-align-center">
        <span>{data.name}</span>
      </div>
      <div className="text-align-center">
        <span>Price: &#8377;{data.price}</span>
      </div>
      <div className="text-align-center">
        <Button onClick={() => { addToCart(data) }}>Add To Cart</Button>
      </div>
    </div>
  )
}

function SideMenu({ children, menuStatus }: { children: ReactNode, menuStatus: boolean }) {
  return (
    <div className={`side-navbar ${menuStatus ? "nav-open" : ""}`}>
      {children}
    </div>
  )
}

function CartMenuContent(
  {
    cartInfo,
    setCartInfo,
    userInfo
  }: {
    cartInfo: any,
    setCartInfo: any,
    userInfo: any
  }) {
  const cartItemsList = Object.values(cartInfo);
  const isOrderPlacable = cartItemsList.some((cartItem: any) => cartItem.requestedQuantity > 0)

  const placeOrder = async () => {
    try {
      let ordersList = cartItemsList.map((cartItem: any) => {
        return {
          userId: userInfo.email,
          productId: cartItem._id,
          quantity: cartItem.requestedQuantity
        }
      })
      ordersList = ordersList.filter((order) => order.quantity > 0);
      console.log(ordersList);
      const storedToken = Cookies.get('token');
      let response: any;
      try {
        response = await fetch(`${serverBaseUrl}/orders/createNew`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${storedToken}`,
            "content-type": 'application/json'
          },
          body: JSON.stringify(ordersList)
        })
      } catch (error: any) {
        throw error.message;
      }
      response = await response.json();
      if (response?.data?.length > 0) {
        setCartInfo({});
        window.alert("Successfully placed the order")
      } else {
        window.alert("Something went wrong. Order wasn't placed")
      }
      console.log(response);
    } catch (error: any) {
      console.log(error);
    }
  }

  return (
    <>
      <h3>Your Cart</h3>
      {cartItemsList.map((cartItem: any, idx: number) =>
        <CartItemCard key={idx} cartItem={cartItem} setCartInfo={setCartInfo} />)
      }
      {
        cartItemsList.length > 0 ?
          (isOrderPlacable ?
            <button
              className="place-order-button"
              onClick={placeOrder}
            >Place Order</button> : ""
          ) : <h4>Your Cart is empty</h4>
      }
    </>
  )
}

function CartItemCard({ cartItem, setCartInfo }: { cartItem: any, setCartInfo: any }) {
  const decreaseQuantity = () => {
    if (cartItem.requestedQuantity > 1) {
      updateCartInfo(cartItem.requestedQuantity - 1);
    } else {
      window.alert("Quantity can't be reduced further");
    }
  }
  const increaseQuantity = () => {
    if (cartItem.requestedQuantity < cartItem.quantity) {
      updateCartInfo(cartItem.requestedQuantity + 1);
    } else {
      window.alert("Quantity can't be increased further");
    }
  }

  const updateCartInfo = (updatedQuantity: number) => {
    setCartInfo((prevCartInfo: any) => {
      const updatedInfo = {
        ...prevCartInfo,
        [cartItem._id]: {
          ...cartItem,
          requestedQuantity: updatedQuantity
        }
      };
      return updatedInfo;
    })
  }

  const removeItem = (cartItem: any) => {
    setCartInfo((previousInfo: any) => {
      const updatedInfo = previousInfo;
      delete updatedInfo[cartItem._id]
      console.log(updatedInfo);
      return { ...updatedInfo };
    })
  }
  return (
    <div className="cart-item">
      <div className="item-details">
        <label>Item Name: {cartItem.name}</label><br />
        <label>Price: &#8377;{cartItem.price}</label><br />
        <label>Weight: {cartItem.weight} gm</label>
      </div>
      <div className="buttons-container">
        <Button onClick={() => { removeItem(cartItem) }}>Remove Item</Button>
        <div>
          <i className="bi bi-dash control-button"
            onClick={decreaseQuantity}
          ></i>
          <label className="quantity-label">Quantity: {cartItem.requestedQuantity}</label>
          <i className="bi bi-plus-lg control-button"
            onClick={increaseQuantity}
          ></i>
        </div>
      </div>
    </div>
  )
}

function MyOrdersMenuContent(
  {
    menuStatus,
    setMyOrderPopup
  }:
    {
      menuStatus: boolean,
      setMyOrderPopup: any
    }) {

  const [myOrdersList, setMyOrdersList] = useState<any[]>([]);

  React.useEffect(() => {
    const storedToken = Cookies.get('token');
    fetch(`${serverBaseUrl}/orders/getMyOrders`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${storedToken}`
      }
    }).then(res => {
      res.json()
        .then((result: any) => {
          console.log(result);
          if (result.data) {
            setMyOrdersList([...result?.data]);
          } else {
            return;
          }
        }).catch(error => {
          console.log(error);
          window.alert(error.message)
        })
    }).catch(error => {
      console.log(error);
      window.alert(error.message)
    })
  }, [menuStatus])

  return (
    <>
      <h3>Your Orders</h3>
      {
        myOrdersList.length > 0 ?
          myOrdersList.map(
            (orderDetails: any, idx: number) =>
              <MyOrderCard
                setMyOrderPopup={setMyOrderPopup}
                key={idx}
                orderDetails={orderDetails}
              />
          ) : <h4>No orders to show</h4>
      }
    </>
  )
}

function MyOrderCard(
  {
    orderDetails,
    setMyOrderPopup
  }:
    {
      orderDetails: any,
      setMyOrderPopup: any
    }) {
  const productDetails = orderDetails.productDetails?.[0];
  return (
    <div
      className="cart-item"
      onClick={() => {
        setMyOrderPopup({
          isOpen: true,
          data: orderDetails
        })
      }}
    >
      <div className="item-details">
        <label>Item Name: {productDetails.name}</label><br />
        <label>Price: &#8377;{productDetails.price}</label><br />
        <label>Weight: {productDetails.weight} gm</label><br />
        <label>Quantity: {orderDetails.quantity}</label><br />
        <label>Status: {orderDetails.status}</label>
      </div>
    </div>
  )
}

function MyOrderPopUp(
  { popupInfo }:
    { popupInfo: any }
) {
  const getClassName = () => {
    return "popup-opened";
  }
  let productDetails;
  if (popupInfo.data) {
    console.log(popupInfo.data);
    productDetails = popupInfo.data.productDetails[0];
  }
  return (
    <div className={`my-order-popup ${popupInfo.isOpen ? `display-block ${getClassName()}` : ""}`}>
      <div className="popup-image-container">
        <img className="popup-product-image" src={productDetails?.image} />
      </div>
      <div className="popup-content">
        <h4>Item Name: {productDetails?.name}</h4>
        <h4>Price: &#8377;{productDetails?.price}</h4>
        <h4>Weight: {productDetails?.weight} gm</h4>
        <h4>Quantity: {popupInfo?.data?.quantity}</h4>
        <h4>Status: {popupInfo?.data?.status}</h4>
      </div>
    </div>
  )
}

export default DashBoard;