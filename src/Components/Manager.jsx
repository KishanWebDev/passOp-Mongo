import React, { useRef, useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Manager = () => {
    const ref = useRef();
    const passwordRef = useRef();
    const [form, setForm] = useState({ site: "", username: "", password: "" });
    const [passwordArray, setPasswordArray] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);

    // Backend URL - replace with your actual backend URL
    const BACKEND_URL = "http://localhost:3000"; // Use your actual backend URL here

    const getPasswords = async () => {
        try {
            setLoading(true);
            let req = await fetch(BACKEND_URL);
            let passwords = await req.json();
            setPasswordArray(passwords);
        } catch (error) {
            console.error("Error fetching passwords:", error);
            toast.error("Failed to fetch passwords");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getPasswords();
    }, []);

    const copyText = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            toast.success('Copied to clipboard!', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
            });
        });
    };

    const showPassword = () => {
        if (passwordRef.current.type === "password") {
            passwordRef.current.type = "text";
            ref.current.src = "icons/eyecross.png";
        } else {
            passwordRef.current.type = "password";
            ref.current.src = "icons/eye.png";
        }
    };

    const generatePassword = () => {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";
        let generatedPassword = "";
        for (let i = 0; i < 12; i++) {
            generatedPassword += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setForm({ ...form, password: generatedPassword });
    };

    const savePassword = async () => {
        if (form.site.length > 3 && form.username.length > 3 && form.password.length > 3) {
            try {
                setLoading(true);
                if (isEditing) {
                    // Edit existing password - send current _id
                    await fetch(BACKEND_URL, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            id: form._id,  // MongoDB uses _id
                            site: form.site,
                            username: form.username,
                            password: form.password
                        })
                    });
                    toast.success("Password updated successfully!");
                } else {
                    // Save new password
                    await fetch(BACKEND_URL, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(form)
                    });
                    toast.success("Password saved successfully!");
                }
                // Refresh the password list
                await getPasswords();
                // Reset form and editing state
                setForm({ site: "", username: "", password: "" });
                setIsEditing(false);
            } catch (error) {
                console.error("Error saving/editing password:", error);
                toast.error("Failed to save/edit password");
            } finally {
                setLoading(false);
            }
        } else {
            toast.error("All fields must be greater than 3 characters!");
        }
    };

    const deletePassword = async (id) => {
        const confirmDelete = window.confirm("Do you really want to delete this password?");
        if (confirmDelete) {
            try {
                setLoading(true);
                await fetch(BACKEND_URL, {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ _id: id }) // MongoDB uses _id
                });
                toast.success('Password Deleted!');
                // Refresh the password list
                await getPasswords();
            } catch (error) {
                console.error("Error deleting password:", error);
                toast.error("Failed to delete password");
            } finally {
                setLoading(false);
            }
        }
    };

    const editPassword = (password) => {
        setForm(password); // Set the entire password object (includes _id)
        setIsEditing(true);
        // Scroll to top for better UX
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const [searchTerm, setSearchTerm] = useState("");
    
    // Filter passwords based on search term
    const filteredPasswords = passwordArray.filter(item => 
        item.site?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        item.username?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
            <ToastContainer />
            <div className="absolute inset-0 -z-10 h-full w-full bg-green-50 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]">
                <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-green-400 opacity-20 blur-[100px]"></div>
            </div>
            <div className="p-3 md:mycontainer min-h-[88.2vh]">
                <h1 className='text-4xl text font-bold text-center'>
                    <span className='text-green-500'> &lt;</span>
                    <span>Pass</span><span className='text-green-500'>OP/&gt;</span>
                </h1>
                <p className='text-green-900 text-lg text-center'>Your own Password Manager</p>

                <div className="flex flex-col p-4 text-black gap-8 items-center">
                    <input 
                        value={form.site} 
                        onChange={handleChange} 
                        placeholder='Enter website URL' 
                        className='rounded-full border border-green-500 w-full p-4 py-1' 
                        type="text" 
                        name="site" 
                        id="site" 
                    />
                    <div className="flex flex-col md:flex-row w-full justify-between gap-8">
                        <input 
                            value={form.username} 
                            onChange={handleChange} 
                            placeholder='Enter Username' 
                            className='rounded-full border border-green-500 w-full p-4 py-1' 
                            type="text" 
                            name="username" 
                            id="username" 
                        />
                        <div className="relative flex w-full">
                            <input 
                                ref={passwordRef} 
                                value={form.password} 
                                onChange={handleChange} 
                                placeholder='Enter Password' 
                                className='rounded-full border border-green-500 w-full p-4 py-1' 
                                type="password" 
                                name="password" 
                                id="password" 
                            />
                            <span className='absolute right-[3px] top-[4px] cursor-pointer' onClick={showPassword}>
                                <img ref={ref} className='p-1' width={26} src="icons/eye.png" alt="eye" />
                            </span>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <button 
                            onClick={generatePassword} 
                            className='bg-blue-400 hover:bg-blue-300 rounded-full px-5 py-2 border border-blue-900'
                        >
                            Generate Password
                        </button>
                        <button 
                            onClick={savePassword} 
                            disabled={loading}
                            className='flex justify-center items-center gap-2 bg-green-400 hover:bg-green-300 rounded-full px-8 py-2 w-fit border border-green-900 disabled:opacity-50'
                        >
                            {loading ? "Processing..." : (isEditing ? "Update" : "Save")}
                        </button>
                    </div>
                </div>

                <div className="passwords">
                    <h2 className='font-bold text-2xl py-4'>Your Passwords</h2>
                    
                    <input 
                        type="text" 
                        placeholder="Search sites or usernames" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="rounded-full border border-green-500 w-full p-4 py-1 mb-4"
                    />
                    
                    {loading && <div className="text-center py-4">Loading...</div>}
                    
                    {!loading && filteredPasswords.length === 0 && <div className="text-center py-4">No passwords to show</div>}
                    
                    {!loading && filteredPasswords.length > 0 && 
                        <table className="table-auto w-full rounded-md overflow-hidden mb-10">
                            <thead className='bg-green-800 text-white'>
                                <tr>
                                    <th className='py-2'>Site</th>
                                    <th className='py-2'>Username</th>
                                    <th className='py-2'>Password</th>
                                    <th className='py-2'>Actions</th>
                                </tr>
                            </thead>
                            <tbody className='bg-green-100'>
                                {filteredPasswords.map((item) => {
                                    return <tr key={item._id}>
                                        <td className='py-2 border border-white text-center'>
                                            <div className='flex items-center justify-center'>
                                                <a href={item.site} target='_blank' rel="noopener noreferrer">{item.site}</a>
                                                <div className='lordiconcopy size-7 cursor-pointer' onClick={() => { copyText(item.site) }}>
                                                    <lord-icon
                                                        style={{ "width": "25px", "height": "25px", "paddingTop": "3px", "paddingLeft": "3px" }}
                                                        src="https://cdn.lordicon.com/iykgtsbt.json"
                                                        trigger="hover" >
                                                    </lord-icon>
                                                </div>
                                            </div>
                                        </td>
                                        <td className='py-2 border border-white text-center'>
                                            <div className='flex items-center justify-center'>
                                                <span>{item.username}</span>
                                                <div className='lordiconcopy size-7 cursor-pointer' onClick={() => { copyText(item.username) }}>
                                                    <lord-icon
                                                        style={{ "width": "25px", "height": "25px", "paddingTop": "3px", "paddingLeft": "3px" }}
                                                        src="https://cdn.lordicon.com/iykgtsbt.json"
                                                        trigger="hover" >
                                                    </lord-icon>
                                                </div>
                                            </div>
                                        </td>
                                        <td className='py-2 border border-white text-center'>
                                            <div className='flex items-center justify-center'>
                                                <span>{"•".repeat(item.password.length)}</span>
                                                <div className='lordiconcopy size-7 cursor-pointer' onClick={() => { copyText(item.password) }}>
                                                    <lord-icon
                                                        style={{ "width": "25px", "height": "25px", "paddingTop": "3px", "paddingLeft": "3px" }}
                                                        src="https://cdn.lordicon.com/iykgtsbt.json"
                                                        trigger="hover" >
                                                    </lord-icon>
                                                </div>
                                            </div>
                                        </td>
                                        <td className='justify-center py-2 border border-white text-center'>
                                            <span className='cursor-pointer mx-1' onClick={() => { editPassword(item) }}>
                                                <lord-icon
                                                    src="https://cdn.lordicon.com/gwlusjdu.json"
                                                    trigger="hover"
                                                    style={{ "width": "25px", "height": "25px" }}>
                                                </lord-icon>
                                            </span>
                                            <span className='cursor-pointer mx-1' onClick={() => { deletePassword(item._id) }}>
                                                <lord-icon
                                                    src="https://cdn.lordicon.com/skkahier.json"
                                                    trigger="hover"
                                                    style={{ "width": "25px", "height": "25px" }}>
                                                </lord-icon>
                                            </span>
                                        </td>
                                    </tr>
                                })}
                            </tbody>
                        </table>
                    }
                </div>
            </div>
        </>
    )
}

export default Manager;