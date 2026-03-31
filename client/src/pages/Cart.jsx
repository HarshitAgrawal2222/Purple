import { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { assets } from "../assets/assets";
import toast from "react-hot-toast";

const Cart = () => {

  const {
    products,
    currency,
    cartItems,
    removeFromCart,
    getCartCount,
    updateCartItems,
    navigate,
    getCartAmount,
    axios,
    user,
    setCartItems
  } = useAppContext();

  const [cartArray, setCartArray] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [showAddress, setShowAddress] = useState(false);
  const [selectedAddress, setselectedAddress] = useState(null);
  const [paymentOption, setPaymentOption] = useState("COD");

  // Convert cart object → array
  const getCart = () => {
    let tempArray = [];

    for (const key in cartItems) {
      const product = products.find((item) => item._id === key);

      if (product) {
        tempArray.push({
          ...product,
          quantity: cartItems[key],
        });
      }
    }

    setCartArray(tempArray);
  };

  // Fetch user addresses
  const getUserAddress = async () => {
    try {
      const { data } = await axios.get(
        "/api/address/get",
        { withCredentials: true }
      );

      if (data.success) {
        setAddresses(data.addresses);

        if (data.addresses.length > 0) {
          setselectedAddress(data.addresses[0]);
        }

      } else {
        toast.error(data.message);
      }

    } catch (error) {
      toast.error(error.message);
    }
  };

  // Place order
  const placeOrder = async () => {
    try {
      if (!selectedAddress) {
        return toast.error("Please select an address");
      }

      if (cartArray.length === 0) {
        return toast.error("Cart is empty");
      }

      if (paymentOption === "COD") {
        const { data } = await axios.post(
          "/api/order/cod",
          {
            items: cartArray.map((item) => ({
              product: item._id,
              quantity: item.quantity,
            })),
            address: selectedAddress,
          },
          { withCredentials: true }
        );

        if (data.success) {
          toast.success(data.message);
          setCartItems({});
          navigate("/my-orders");
        } else {
          toast.error(data.message);
        }

      } else {
        const { data } = await axios.post(
          "/api/order/stripe",
          {
            items: cartArray.map((item) => ({
              product: item._id,
              quantity: item.quantity,
            })),
            address: selectedAddress,
          },
          { withCredentials: true }
        );

        if (data.success) {
          window.location.replace(data.url);
        } else {
          toast.error(data.message);
        }
      }

    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (products.length > 0 && cartItems) {
      getCart();
    }
  }, [products, cartItems]);

  useEffect(() => {
    if (user) {
      getUserAddress();
    }
  }, [user]);
  
  useEffect(() => {
    getUserAddress();
  }, []); // ✅ ADD THIS

  return products.length > 0 && cartItems ? (
    <div className="flex flex-col md:flex-row mt-16">

      {/* LEFT SIDE */}
      <div className='flex-1 max-w-4xl'>
        <h1 className="text-3xl font-medium mb-6">
          Shopping Cart <span className="text-sm text-primary">{getCartCount()} Items</span>
        </h1>

        <div className="grid grid-cols-[2fr_1fr_1fr] text-gray-500 pb-3">
          <p>Product Details</p>
          <p className="text-center">Subtotal</p>
          <p className="text-center">Action</p>
        </div>

        {cartArray.map((product, index) => (
          <div key={index} className="grid grid-cols-[2fr_1fr_1fr] items-center pt-3">

            <div
              onClick={() => {
                navigate(`/products/${product.category.toLowerCase()}/${product._id}`);
                scrollTo(0, 0);
              }}
              className="flex items-center gap-4 cursor-pointer"
            >
              <img src={product.image[0]} className="w-20 h-20 object-cover" />

              <div>
                <p className="font-semibold">{product.name}</p>

                <div className="text-sm text-gray-500">
                  <p>Weight: {product.weight || "N/A"}</p>

                  <select
                    onChange={(e) =>
                      updateCartItems(product._id, Number(e.target.value))
                    }
                    value={cartItems[product._id]}
                  >
                    {[...Array(9)].map((_, i) => (
                      <option key={i} value={i + 1}>{i + 1}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <p className="text-center">
              {currency}{product.offerPrice * product.quantity}
            </p>

            <button onClick={() => removeFromCart(product._id)}>
              <img src={assets.remove_icon} className="w-5 mx-auto" />
            </button>

          </div>
        ))}

        <button
          onClick={() => navigate("/products")}
          className="mt-6 text-primary"
        >
          Continue Shopping
        </button>

      </div>

      {/* RIGHT SIDE */}
      <div className="max-w-[360px] w-full p-5 border ml-6">

        <h2 className="text-xl font-medium">Order Summary</h2>

        <div className="mt-4">

          {/* ADDRESS */}
          <p className="text-sm font-medium">Delivery Address</p>

          <div className="relative mt-2">

            <p className="text-gray-500">
              {selectedAddress ? (
                <>
                  {selectedAddress.street}, {selectedAddress.city}
                  {selectedAddress.state && `, ${selectedAddress.state}`},
                  {selectedAddress.zipcode}, {selectedAddress.country}
                  <br />
                  Ph: {selectedAddress.phone}
                </>
              ) : "No address found"}
            </p>

            <button
              onClick={() => setShowAddress(!showAddress)}
              className="text-primary mt-1"
            >
              Change
            </button>

            {showAddress && (
              <div className="absolute bg-white border w-full mt-2 z-10">

                {addresses.map((addr, index) => (
                  <p
                    key={index}
                    onClick={() => {
                      setselectedAddress(addr);
                      setShowAddress(false);
                    }}
                    className="p-2 hover:bg-gray-100 cursor-pointer"
                  >
                    {addr.street}, {addr.city}
                  </p>
                ))}

              </div>
            )}

            {/* ✅ ALWAYS VISIBLE */}
            <p
              onClick={() => navigate("/add-address")}
              className="text-primary text-center mt-2 cursor-pointer"
            >
              + Add New Address
            </p>

          </div>

          {/* PAYMENT */}
          <p className="mt-6 text-sm font-medium">Payment Method</p>

          <select
            onChange={(e) => setPaymentOption(e.target.value)}
            className="w-full border p-2 mt-2"
          >
            <option value="COD">Cash On Delivery</option>
            <option value="Online">Online Payment</option>
          </select>

        </div>

        {/* PRICE */}
        <div className="mt-4 space-y-2 text-gray-600">
          <p className="flex justify-between">
            <span>Price</span>
            <span>{currency}{getCartAmount()}</span>
          </p>

          <p className="flex justify-between">
            <span>Tax</span>
            <span>{currency}{(getCartAmount() * 0.02).toFixed(2)}</span>
          </p>

          <p className="flex justify-between font-semibold">
            <span>Total</span>
            <span>{currency}{(getCartAmount() * 1.02).toFixed(2)}</span>
          </p>
        </div>

        <button
          onClick={placeOrder}
          className="w-full mt-4 bg-primary text-white py-2"
        >
          Place Order
        </button>

      </div>

    </div>
  ) : null;
};

export default Cart;