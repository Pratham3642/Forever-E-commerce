import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from 'axios';

export const ShopContext = createContext();

const ShopContextProvider = (props) => {

    const currency = "₹";
    const delivery_fee = 10;
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const [search, setSearch] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [cartItems, setCartItems] = useState({});
    const [products, setProducts] = useState([]);
    const [token, setToken] = useState('');
    const navigate = useNavigate();

    const addToCart = async (itemsId, size) => {

        let cartData = structuredClone(cartItems);

        if (!size) {
            toast.error('Select Product size')
            return;
        }

        if (cartData[itemsId]) {
            if (cartData[itemsId][size]) {
                cartData[itemsId][size] += 1;
            }
            else {
                cartData[itemsId][size] = 1;
            }
        }
        else {
            cartData[itemsId] = {};
            cartData[itemsId][size] = 1;
        }
        setCartItems(cartData);

        if (token) {
            try {
                await axios.post(backendUrl + '/api/cart/add', { itemsId, size }, { headers: { token } })
            } catch (error) {
                console.log(error);
                toast.error(error.message);
            }
        }

    }

    const getCartCount = () => {
        let totalCount = 0;
        for (const items in cartItems) {
            for (const item in cartItems[items]) {
                try {
                    if (cartItems[items][item] > 0) {
                        totalCount += cartItems[items][item];
                    }
                } catch (error) {

                }
            }
        }
        return totalCount;
    }

    const updateQuantity = async (itemsId, size, quantity) => {
        let cartData = structuredClone(cartItems);

        cartData[itemsId][size] = quantity;

        setCartItems(cartData);

        if(token){

            try {

                await axios.post(backendUrl + '/api/cart/update', { itemsId, size, quantity }, { headers: { token } });
                
            } catch (error) {
                console.log(error);
                toast.error(error.message);
            }

        }
    }

    const getCartAmount = () => {
        let totalAmount = 0;
        for (const items in cartItems) {
            let itemInfo = products.find((product) => product._id === items);
            for (const item in cartItems[items]) {
                try {
                    if (cartItems[items][item] > 0) {
                        totalAmount += itemInfo.price * cartItems[items][item];
                    }
                } catch {

                }
            }
        }
        return totalAmount;
    }


    const getProductsData = async () => {
        try {
            const response = await axios.get(`${backendUrl}/api/product/list`);
            //console.log('API Response:', response.data); // Debug the API response
            if (response.data.success && response.data.products) {
                setProducts(response.data.products);
                //console.log('Updated Products State:', response.data.products); // Confirm state update
            } else {
                toast.error(response.data.message || 'Failed to fetch products');
                setProducts([]); // Reset products to an empty array
            }
        } catch (error) {
            //console.error('Error fetching products:', error);
            toast.error('An error occurred while fetching products');
            setProducts([]); // Ensure products is always defined
        }
    }


    const getUserCart = async (token) =>{
        try {
            
            const response = await axios.post(backendUrl +'/api/cart/get',{},{headers:{token}})
            if(response.data.success){
                setCartItems(response.data.cartData);
            }

        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    }

    useEffect(() => {
        getProductsData();
    }, [])

    useEffect(() => {
        if (!token && localStorage.getItem('token')) {
            setToken(localStorage.getItem('token'));
            getUserCart(localStorage.getItem('token'))
        }
    },[]) 


    const value = {
        products, currency, delivery_fee,
        search, setSearch, showSearch, setShowSearch,
        cartItems, setCartItems, addToCart,
        getCartCount, updateQuantity,
        getCartAmount, navigate, backendUrl,
        token, setToken
    }


    return (
        <ShopContext.Provider value={value}>
            {props.children}
        </ShopContext.Provider>
    )
}

export default ShopContextProvider;
