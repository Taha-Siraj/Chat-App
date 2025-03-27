import { useState } from 'react';
import Header from './Header';

export default function UserList() {

  const [selectedUser , setSelectedUser] = useState(null);
  console.log(selectedUser  )
  const data = [
    {
      "id": 1,
      "name": "Ali Raza",
      "profile_image": "https://randomuser.me/api/portraits/men/1.jpg"
    },
    
    {
      "id": 2,
      "name": "Ahmed Sheikh",
      "profile_image": "https://randomuser.me/api/portraits/men/3.jpg"
    },
    {
      "id": 4,
      "name": "Hina Malik",
      "profile_image": "https://randomuser.me/api/portraits/women/4.jpg"
    },
    {
      "id": 5,
      "name": "Zaid Farooq",
      "profile_image": "https://randomuser.me/api/portraits/men/5.jpg"
    },
    {
      "id": 6,
      "name": "Mehwish Noor",
      "profile_image": "https://randomuser.me/api/portraits/women/6.jpg"
    },
  
  ];

  return (
    <>
      <Header />
      <div className='flex h-[88vh] w-[100%] font-mono capitalize'>
        <div className='min-h-[88vh] w-[450px] bg-gray-800'>
          <div>
            {data.map((user) => (
              <div 
                key={user.id} 
                className='flex p-4 items-center gap-x-4 cursor-pointer hover:bg-gray-700 transition'
              onClick={() => setSelectedUser(user)}>
                <img src={user.profile_image} alt="" className='rounded-full h-[60px] w-[60px]' />
                <h1 className='text-white text-2xl font-mono'>{user.name}</h1>
              </div>
            ))}
          </div>
        </div>

        <div className='flex flex-col items-center justify-between w-full  min-h-[88vh] bg-gray-900 p-6 text-white'>
          <div>
            {(selectedUser) ?(
             <>
              <h1 className='text-3xl font-bold'></h1>
              <p className='text-lg mt-2'>Chat with {selectedUser.name}</p>
             </>
              
            ):
            <h1 className='text-3xl text-gray-400'>Select a user to start chatting</h1>
            }
   
      
    
          </div>
          <div className='w-full flex gap-x-3 capitalize text-xl font-mono'>
          <input type="text" className='py-2 px-4 w-full bg-gray-800 rounded-md border hover:border-[#4a9bff]  outline-none'  />
          <button className='bg-[#4a9bff] py-2 px-4 rounded-md'> Sent</button>
          </div>
        </div>
      </div>
    </>
  );
}
