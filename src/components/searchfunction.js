import React from 'react';
import './searchfunction.css';


const Search = ({ searchTerm, setSearchTerm }) => {
    return (
        <div className="search-container">
            <input
                type="text"
                className="search-input"
                placeholder="Search for veteran..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button 
            className="clear-button"
            onClick={() => setSearchTerm('')}>x</button>
        </div>
    );
};

export default Search;