import React from 'react';

const NavComp = ({ sectionRefs, visibleSection }) => {
    // Function to scroll to a specific section
    const scrollToSection = (section) => {
        sectionRefs[section].current.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest',
        });
    };

    return (
        <>
            {/* NavBar */}
            <div
                className="fixed top-1/2 left-[20px] transform -translate-y-1/2 flex flex-col justify-center items-center transition-all duration-[450ms] ease-in-out w-16"
            >
                <article
                    className="border border-solid border-gray-700 w-full ease-in-out duration-500 left-0 rounded-2xl inline-block shadow-lg shadow-black/15 bg-slate-400"
                >
                    {/* Portfolio Inputs */}
                    <label
                        className={`relative w-full h-16 p-4 ease-in-out duration-300 border-solid border-black/10 group flex flex-row gap-3 items-center justify-center text-black rounded-xl ${
                            visibleSection === 'portfolioInputs' ? 'bg-slate-600 shadow-lg' : 'hover:bg-gray-500 hover:text-indigo-600'
                        }`}
                        onClick={() => scrollToSection('portfolioInputs')}
                    >
                        <i className={`fa-solid fa-briefcase text-2xl ${visibleSection === 'portfolioInputs' && 'text-indigo-400'}`}></i>
                    </label>

                    {/* Portfolio */}
                    <label
                        className={`relative w-full h-16 p-4 ease-in-out duration-300 border-solid border-black/10 group flex flex-row gap-3 items-center justify-center text-black rounded-xl ${
                            visibleSection === 'portfolio' ? 'bg-slate-600 shadow-lg' : 'hover:bg-gray-500 hover:text-indigo-600'
                        }`}
                        onClick={() => scrollToSection('portfolio')}
                    >
                        <i className={`fa-solid fa-list text-2xl ${visibleSection === 'portfolio' && 'text-indigo-400'}`}></i>
                    </label>

                    {/* Matrices */}
                    <label
                        className={`relative w-full h-16 p-4 ease-in-out duration-300 border-solid border-black/10 group flex flex-row gap-3 items-center justify-center text-black rounded-xl ${
                            visibleSection === 'matrices' ? 'bg-slate-600 shadow-lg' : 'hover:bg-gray-500 hover:text-indigo-600'
                        }`}
                        onClick={() => scrollToSection('matrices')}
                    >
                        <i className={`fa-solid fa-table text-2xl ${visibleSection === 'matrices' && 'text-indigo-400'}`}></i>
                    </label>

                    {/* Constraints */}
                    <label
                        className={`relative w-full h-16 p-4 ease-in-out duration-300 border-solid border-black/10 group flex flex-row gap-3 items-center justify-center text-black rounded-xl ${
                            visibleSection === 'constraints' ? 'bg-slate-600 shadow-lg' : 'hover:bg-gray-500 hover:text-indigo-600'
                        }`}
                        onClick={() => scrollToSection('constraints')}
                    >
                        <i className={`fa-solid fa-arrows-left-right-to-line text-2xl ${visibleSection === 'constraints' && 'text-indigo-400'}`}></i>
                    </label>

                    {/* Charts */}
                    <label
                        className={`relative w-full h-16 p-4 ease-in-out duration-300 border-solid border-black/10 group flex flex-row gap-3 items-center justify-center text-black rounded-xl ${
                            visibleSection === 'charts' ? 'bg-slate-600 shadow-lg' : 'hover:bg-gray-500 hover:text-indigo-600'
                        }`}
                        onClick={() => scrollToSection('charts')}
                    >
                        <i className={`fa-solid fa-chart-line text-2xl ${visibleSection === 'charts' && 'text-indigo-400' }`}></i>
                    </label>

                    {/* Results */}
                    <label
                        className={`relative w-full h-16 p-4 ease-in-out duration-300 border-solid border-black/10 group flex flex-row gap-3 items-center justify-center text-black rounded-xl ${
                            visibleSection === 'results' ? 'bg-slate-600 shadow-lg' : 'hover:bg-gray-500 hover:text-indigo-600'
                        }`}
                        onClick={() => scrollToSection('results')}
                    >
                        <i className={`fa-solid fa-download text-2xl ${visibleSection === 'results' && 'text-indigo-400'}`}></i>
                    </label>
                </article>
            </div>
        </>
    );
};

export default NavComp;
