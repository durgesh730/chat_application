import React, { useState } from 'react'
import Lottie from "lottie-react";
import gif from "../assets/Animation - 1727949024275.json"

const Test = () => {
    const categories = [
        {
            id: 1,
            categoryName: 'Breakfast',
            image: 'https://images.pexels.com/photos/257816/pexels-photo-257816.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        },
        {
            id: 2,
            categoryName: 'Lunch',
            image: 'https://images.pexels.com/photos/257816/pexels-photo-257816.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        },
        {
            id: 3,
            categoryName: 'Dinner',
            image: 'https://images.pexels.com/photos/257816/pexels-photo-257816.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        },
        {
            id: 4,
            categoryName: 'Snacks',
            image: 'https://images.pexels.com/photos/257816/pexels-photo-257816.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        }
    ];

    const [selectedCategory, setSelectedCategory] = useState(categories[0].categoryName);

    // Function to handle category selection
    const handleCategorySelect = (category) => {
        setSelectedCategory(category);
    };

    return (
        <>
            <div className="min-h-screen bg-white overflow-hidden">
                {/* Navbar */}
                <nav className="flex justify-between items-center py-6 px-12 bg-white">
                    <div className="text-2xl font-bold text-gray-800">Foodie</div>
                    <ul className="md:flex hidden space-x-8 text-gray-700">
                        <li><a href="#" className="hover:text-orange-500">Home</a></li>
                        <li><a href="#" className="hover:text-orange-500">Packages</a></li>
                        <li><a href="#" className="hover:text-orange-500">About us</a></li>
                        <li><a href="#" className="hover:text-orange-500">Contact us</a></li>
                    </ul>
                </nav>

                {/* Main Content */}
                <div className="md:flex justify-center items-center px-0 pt-0 pb-12">
                    <div className="md:w-[50%] w-full">
                        <h1 className="text-6xl font-bold text-gray-800 leading-tight">
                            Your Favourite Food <br /> Delivered Hot & Fresh
                        </h1>
                        <p className="text-lg text-gray-500">
                            Healthy switcher chefs do all the prep work, like peeling, chopping & marinating, so you can cook a fresh meal.
                        </p>
                        <button className="mt-8 bg-orange-500 text-white py-3 px-8 rounded-full text-lg font-semibold shadow-lg hover:bg-orange-600 transition-all duration-300">
                            Order Now ➔
                        </button>
                    </div>

                    <div className="md:w-[40%] w-full">
                        <Lottie animationData={gif} loop={true} />
                    </div>
                </div>
            </div>

            <div className="max-w-full my-12">
                <h2 className="text-2xl text-center font-bold text-gray-800 mb-6">Meal Categories</h2>
                <div className="flex space-x-4 justify-center">
                    {categories.map((category, index) => (
                        <div className='text-center cursor-pointer'>
                            <div
                                key={index}
                                className={`h-32 w-32 rounded-full overflow-hidden ${selectedCategory === category.id
                                    ? 'bg-orange-500 border-8 border-orange-500'
                                    : 'bg-white border-8 border-gray-300 hover:bg-gray-100'
                                    } focus:outline-none transition-all duration-300`}
                                onClick={() => handleCategorySelect(category.id)}
                            >
                                <img
                                    src={category.image}
                                    alt={category}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <span className="text-center text-sm font-semibold text-gray-800">
                                {category.categoryName}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

export default Test
