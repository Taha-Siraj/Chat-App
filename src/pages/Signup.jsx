import React, { useState , useEffect , useContext} from 'react'
import { BiSolidHide } from "react-icons/bi";
import { BiSolidShow } from "react-icons/bi";
import { Link, useNavigate } from 'react-router-dom';
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { GlobalContext } from './Context/Context';
import { ClipLoader } from 'react-spinners';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast, Bounce } from 'react-toastify';

const Signup = () => {

    const [ passwordShown, setPasswordShown ] = useState(false);
    const [ email, setEmail ] = useState('');
    const [ password, setPassword ] = useState('');
    const [ name, setName ] = useState('');
    const [ loading, setLoading ] = useState(false);
    const { state, dispatch } = useContext(GlobalContext);

    useEffect(() => {
        console.log("state", state);
    } , [state]);
    
    const navigate = useNavigate();
    const handleSubmit = async (e) => {
        e.preventDefault();
        if(!email || !password || !name) {
            toast.warn('Fill all the input fields!', {
                position: "top-center",
                autoClose: 1000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
                transition: Bounce,
                });
                
            return;
        }
        else if(password.length < 6) {
            toast.warn('Password must be at least 6 characters long!', {
                position: "top-center",
                autoClose: 1000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
                transition: Bounce,
                });
            return;
        }
        setLoading(true);
        const auth = getAuth();
        createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            console.log(user);
            setLoading(false);
            dispatch( {type: 'USER_LOGIN', payload: user})
            navigate("/")
            toast.success('Account Created Successfully!', {
                position: "top-center",
                autoClose: 1000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
                transition: Bounce,
                });
                updateProfile(auth.currentUser, {
                    displayName: name,
                    photoURL: "https://rb.gy/hum5zi"
                }).then(() => {
                    console.log('Profile Updated!');
                }).catch((error) => {
                    console.log('Profile Update Error!');
                })
        })
        .catch((error) => {
            setLoading(false);
            const errorCode = error.code;
            const errorMessage = error.message;
            toast.error('Email Already In Use!', {
                position: "top-center",
                autoClose: 1000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
                transition: Bounce,
                });
    });
}
    return (
    <div>
        <ToastContainer
        position="top-center"
        autoClose={1000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        transition={Bounce}
/>
      <section className="bg-gray-50 dark:bg-gray-900">
  <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
      <a href="#" className="flex items-center mb-6 text-2xl font-extrabold text-gray-900 dark:text-white capitalize font-mono  ">
         
      welcome To Chat App
      </a>
      <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
              <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white font-mono">
                  Sign in to your account
              </h1>
              <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6 " action="#">
                  <div>
                      <label for="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Username</label>
                      <input type="text" name="email" id="email" className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
                      onChange={(e)  => setName(e.target.value)}
                      value={name}
                      placeholder="name@company.com" required=""/>
                  </div>
                  <div>
                      <label for="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Your email</label>
                      <input type="email" name="email" id="email" className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
                      onChange={(e)  => setEmail(e.target.value)}
                      value={email}
                      placeholder="name@company.com" required=""/>
                  </div>
                  <div className='relative'>
                      <label for="password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Password</label>
                      <input type={passwordShown ? "text" : "password"}
                        onChange={(e) => setPassword(e.target.value)}
                        value={password}
                       name="password" id="password" placeholder="••••••••" className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required=""/>
                      <span className='cursor-pointer text-xl absolute top-10 left-[350px] ' onClick={() => setPasswordShown(prev => !prev)}> {passwordShown ?  <BiSolidShow/> : <BiSolidHide/>} </span>
                  </div>
                  
                  <button 
                    type="submit" 
                    className="w-full bg-black text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 flex items-center justify-center"
                >
                    {loading ? (
                        <ClipLoader size={20} color="#fff" className="mr-2" />
                    ) : null}
                    {loading ? null : "Sign in"}
                </button>
                  <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                      Already have an account! <Link className="font-medium text-primary-600 hover:underline dark:text-primary-500" to='/login' >Login </Link>
                  </p>
              </form>
          </div>
      </div>
  </div>
</section>
    </div>
  )
}

export default Signup
