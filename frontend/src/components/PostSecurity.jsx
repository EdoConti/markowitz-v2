import React from 'react'
import Loader from './Loader'
import ErrorBanner from './ErrorBanner'

const PostSecurity = (props) => {
    const {setTicker, handlePostSecurity, loading, error, successMessage } = props

    if (loading) {
        return <Loader/>
    }

    if (error) {
        return <ErrorBanner all_error={error}/>
    }


    return (
        /* From Uiverse.io by themrsami */ 
        <div className="absolute top-[225px] right-[170px] flex flex-col items-center justify-center light">
            <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                    Post by Ticker 
                </h2>
                {successMessage && <p className='bg-green-400 w-full flex justify-center my-2 text-white font-semibold'>{successMessage}</p>}
                <form className="flex flex-col" onSubmit={handlePostSecurity}>
                    <input
                        type="text"
                        className="bg-gray-100 text-gray-800 border-0 rounded-md p-2 mb-4 focus:bg-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 transition ease-in-out duration-150"
                        placeholder="AAPL, SPY, ..."
                    onChange={(e) => {setTicker(e.target.value)}}/>
                    <button
                        type="submit"
                        className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white font-bold py-2 px-4 rounded-md mt-4 hover:bg-indigo-600 hover:to-blue-600 transition ease-in-out duration-150">
                        Post
                    </button>
                </form>
            </div>
        </div>
    )
}

export default PostSecurity
