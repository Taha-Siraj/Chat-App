import React, { useState , useContext, useEffect } from 'react'
import { BiSolidHide } from "react-icons/bi";
import { BiSolidShow } from "react-icons/bi";
import { Link, useNavigate } from 'react-router-dom';
import { getAuth, signInWithEmailAndPassword, GoogleAuthProvider ,signInWithPopup , sendPasswordResetEmail   } from "firebase/auth";
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast, Bounce } from 'react-toastify';
import { ClipLoader } from 'react-spinners';
import { GlobalContext } from './Context/Context';

const Login = () => {
    const [ passwordShown, setPasswordShown ] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [Googleloading, setGoogleLoading] = useState(false);
    const navigate = useNavigate();
    const {state , dispatch} = useContext(GlobalContext);

    useEffect(() => {
        console.log("state hai ya nhi !!", state);
    } , [state , loading]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if(!email || !password) {
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
        setLoading(true);
        const auth = getAuth();
signInWithEmailAndPassword(auth, email, password)
  .then((userCredential) => {
    const user = userCredential.user;
    console.log("user", user)
    setLoading(false);
    toast.success('Logged in successfully!', {
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
        dispatch({type: 'USER_LOGIN', payload: user});
        navigate("/userList")
  })
  .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      setLoading(false);
    toast.error('invalid- User!', {
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
    const forgotPassword = () => {
        const auth = getAuth();
sendPasswordResetEmail(auth, email)
  .then(() => {
    toast.success('Email verifivation Sent!', {
        position: "top-center",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        transition: Bounce,
  })})

  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    toast.error('invalid- User!', {
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
    
    const signInWithGoogle = () => {
      setGoogleLoading(true)
      const auth = getAuth();
      const provider = new GoogleAuthProvider();
      signInWithPopup(auth, provider)
      .then((result) => {
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential.accessToken;
        const user = result.user;
        
        toast.success('successfully signin With Google!', {
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
          setGoogleLoading(false)
        dispatch({type: 'USER_LOGIN', payload: user});
        navigate("/userlist")

        }).catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          const email = error.customData.email;
          const credential = GoogleAuthProvider.credentialFromError(error);
          toast.error('Not signin With Google!', {
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
      <section className="bg-gray-950 dark:bg-gray-900">
  <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
         <h1 className='py-4 text-4xl font-mono font-semibold text-white'> Login Form</h1>
      <div className="w-full bg-white rounded-lg shadow dark:border font-mono capitalize md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
              <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                  Sign in to your account
              </h1>
              <form  onSubmit={handleSubmit} className="space-y-4 md:space-y-6" action="#">
                  <div>
                      <label for="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Your email</label>
                      <input type="email" name="email" id="email" className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com" required=""/>
                  </div>
                  <div className='relative'>
                      <label for="password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Password</label>
                      <input type={passwordShown ? "text" : "password"} name="password" id="password" placeholder="••••••••" className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      onChange={(e) => setPassword(e.target.value)}
                      required=""/>
                      <span className='cursor-pointer text-xl absolute top-10 left-[350px] ' onClick={() => setPasswordShown(prev => !prev)}> {passwordShown ?  <BiSolidShow/> : <BiSolidHide/>} </span>
                  </div>
                  <div className="flex items-center justify-between">
                      <div className="flex items-start">
                          <div className="flex items-center h-5">
                            <input id="remember" aria-describedby="remember" type="checkbox" className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-primary-600 dark:ring-offset-gray-800" required=""/>
                          </div>
                          <div className="ml-3 text-sm">
                            <label for="remember" className="text-gray-500 dark:text-gray-300">Remember me</label>
                          </div>
                      </div>
                      <a href="#" className="text-sm font-medium text-primary-600 hover:underline dark:text-primary-500" onClick={forgotPassword} >Forgot password?</a>
                  </div>
                  <button type="submit" className="w-full bg-black text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">
                    {loading ? <ClipLoader size={25} color="#fff"  /> : null  }
                       {loading ? null : "Login"}
                  </button>
                  <p className="text-sm font-light text-gray-800 dark:text-gray-400">
                      Don’t have an account yet? <Link className="font-medium text-primary-600 hover:underline dark:text-primary-900" to="/signup" > Signup</Link>
                  </p>
              </form>
                  <button type="submit" className="w-full bg-black text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800" onClick={signInWithGoogle}>
                    {Googleloading ? <ClipLoader size={25} color="#fff"  /> : null }
                       {Googleloading ? null : "Sign in with Google"}
                     
                  </button>
          </div>
      </div>
  </div>
</section>
    </div>
  )
}

export default Login
