import React from "react";
import Loader from "./Loader";
import ErrorBanner from "./ErrorBanner";

const SecuritiesDropdown = ({ securities, all_error, all_loading, selectedSecurities, setSelectedSecurities, getAssetInfo, setAssetInfo }) => {

  // Handle security selection with max of 10
    const handleSelection = (event) => {
        const { value, checked } = event.target;
        let updatedSelectedSecurities = [...selectedSecurities];

        if (checked) {
        // Add security if not already selected
        if (updatedSelectedSecurities.length < 10) {
            updatedSelectedSecurities.push(value);
        } else {
            alert("You can select a maximum of 10 securities.");
        }
        } else {
        // Remove security if unchecked
        updatedSelectedSecurities = updatedSelectedSecurities.filter(
            (security) => security !== value
        );
        }

        setSelectedSecurities(updatedSelectedSecurities);
    };

    const groupedByParent = securities.reduce((groups, sec) => {
        const [parent, child] = (sec.proxy_category || "Other").split("/");

        if (!groups[parent]) groups[parent] = {};
        
        // If there's a child category, use it; otherwise put directly under parent
        const subgroup = child && child.trim() !== "" ? child : null;

        if (subgroup) {
            if (!groups[parent][subgroup]) groups[parent][subgroup] = [];
            groups[parent][subgroup].push(sec);
        } else {
            // Put directly under parent with key "_noChild"
            if (!groups[parent]._noChild) groups[parent]._noChild = [];
            groups[parent]._noChild.push(sec);
        }

        return groups;
    }, {});


    if (all_loading) {
        return (
            <div className='flex justify-center items-center my-8'>
                <Loader/>
            </div>);
    }

    if (all_error) {
        return (
            <div className='flex justify-center items-center my-8'>
                <ErrorBanner all_error={all_error}/>
            </div>);
    }

    return (
        <div className="p-4 h-2/3 mb-8">
            <div className="flex justify-between items-start">
                {/* Label and Selected Securities */}
                <div className="flex space-x-4 items-center mb-4">
                    <p className="text-xl font-medium text-gray-100 mb-2">
                        Select up to 10 Securities:
                    </p>
                    {selectedSecurities.length > 0 && (
                        <div className="flex flex-wrap items-center justify-start gap-y-2">
                        {selectedSecurities.map((selected) => (
                            <p key={selected} className="p-2 rounded-md mr-2 bg-white shadow-md">
                            {securities.find((s) => s.ticker === selected).long_name}:{" "}
                            {selected}
                            </p>
                        ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Scrollable grouped dropdown */}
            <div className="max-h-[55vh] overflow-y-auto border border-gray-300 p-4 rounded-md bg-white">
                {Object.entries(groupedByParent).map(([parent, subgroups]) => (
                    <div key={parent} className="mb-6">
                    {/* Parent heading */}
                    <h2 className="text-xl font-bold text-gray-800 mb-3 border-b-2 border-slate-700">{parent}</h2>

                    {Object.entries(subgroups).map(([child, items]) => (
                        <div key={child} className="mb-4 pl-4">
                        {/* Only show child heading if it isn’t the "_noChild" bucket */}
                        {child !== "_noChild" && (
                            <h3 className="text-md font-semibold text-gray-600 mb-2">{child}</h3>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            {items.map((security) => (
                            <label
                                key={security.ticker}
                                className="flex items-center space-x-2 text-md"
                            >
                                <input
                                type="checkbox"
                                value={security.ticker}
                                checked={selectedSecurities.includes(security.ticker)}
                                onChange={handleSelection}
                                className="form-checkbox h-4 w-4 text-indigo-600 border-gray-300 rounded focus:indigo-500"
                                />
                                <span>{`${security.long_name}: ${security.ticker}`}</span>
                            </label>
                            ))}
                        </div>
                        </div>
                    ))}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SecuritiesDropdown;
