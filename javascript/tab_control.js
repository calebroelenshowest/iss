// Script for html page app.html.
// Creates the TABS behaviour.

let selectedTab = "locate"; // Which tab is now selected

// Change the current tab if the current tab is different from the requested tab.
const changeTab = (tabname) => {
    // Disable all tabs
    let locateContent = document.querySelector(".js-tab-locate");
    let statsContent = document.querySelector(".js-tab-stats");
    let qenaContent = document.querySelector(".js-tab-qena");
    let locateTab = document.querySelector(".js-tab-locate-btn");
    let statsTab = document.querySelector(".js-tab-stats-btn");
    let qenaTab = document.querySelector(".js-tab-qena-btn");
    let content = document.querySelector(".js-tabs-content");
    // Is the requested tab different from the current tab.
    if(selectedTab !== tabname){
        selectedTab = tabname; // Set the selected tab
        locateTab.classList.remove("c-tabs-selected");
        statsTab.classList.remove("c-tabs-selected");
        qenaTab.classList.remove("c-tabs-selected");
        locateTab.classList.remove("c-tabs-unselected");
        statsTab.classList.remove("c-tabs-unselected");
        qenaTab.classList.remove("c-tabs-unselected");
        content.classList.remove("c-tabs-content__selected-corner-left");
        content.classList.remove("c-tabs-content__selected-corner-right");

        // Hide and show content of the tabs.
        switch(tabname){
            case "locate":
                locateContent.classList.remove("u-hide");
                statsContent.classList.add("u-hide");
                qenaContent.classList.add("u-hide");
                locateTab.classList.add("c-tabs-selected");
                content.classList.add("c-tabs-content__selected-corner-right");
                break;
            case "stats":
                locateContent.classList.add("u-hide");
                statsContent.classList.remove("u-hide");
                qenaContent.classList.add("u-hide");
                statsTab.classList.add("c-tabs-selected");
                content.classList.add("c-tabs-content__selected-corner-right");
                content.classList.add("c-tabs-content__selected-corner-left");
                break;
            case "qena":
                locateContent.classList.add("u-hide");
                statsContent.classList.add("u-hide");
                qenaContent.classList.remove("u-hide");
                qenaTab.classList.add("c-tabs-selected");
                content.classList.add("c-tabs-content__selected-corner-left");

        }
    }
};
// Register the event listeners for the tab buttons.
const registerTabs = () => {
    let locateTab = document.querySelector(".js-tab-locate-btn");
    let statsTab = document.querySelector(".js-tab-stats-btn");
    let qenaTab = document.querySelector(".js-tab-qena-btn");
    // Tab locate
    locateTab.addEventListener("click", function () {
        changeTab("locate");
    });
    // Tab stats
    statsTab.addEventListener("click", function () {
        changeTab("stats");
    });
    // Tab Q & A
    qenaTab.addEventListener("click", function () {
        changeTab("qena");
    });

};

// Init => Make sure DOM elements are loaded.
const init = () => {
    registerTabs();

};
document.addEventListener("DOMContentLoaded", init);
