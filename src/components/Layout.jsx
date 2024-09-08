import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

const Layout = ({ children }) => {
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

    const handleSidebarToggle = (isExpanded) => {
        setIsSidebarExpanded(isExpanded);
    };

    return (
    
        <div className="flex">
            <Sidebar onToggle={handleSidebarToggle} />
            <div className={`w-full ${isSidebarExpanded ? "ml-56" : "ml-16"}`}>
                <Header />
                <div className="p-4">
                    {children}
                </div>
            </div>
        </div>
    
    );
};

export default Layout;
