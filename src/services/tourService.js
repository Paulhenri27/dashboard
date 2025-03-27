import Shepherd from "shepherd.js";
import "shepherd.js/dist/css/shepherd.css";

export function createDashboardTour() {
    const createOverlay = () => {
        const overlay = document.createElement("div");
        overlay.id = "tour-overlay";
        overlay.style.position = "fixed";
        overlay.style.top = "0";
        overlay.style.left = "0";
        overlay.style.width = "100%";
        overlay.style.height = "100%";
        overlay.style.backgroundColor = "rgba(0, 0, 0, 0.5)"; // Semi-transparent gray
        overlay.style.zIndex = "9998"; // Ensure it's below the tour steps
        document.body.appendChild(overlay);
    };

    // Remove the background overlay
    const removeOverlay = () => {
        const overlay = document.getElementById("tour-overlay");
        if (overlay) {
            document.body.removeChild(overlay);
        }
    };

    const tour = new Shepherd.Tour({
        defaultStepOptions: {
            cancelIcon: {
                enabled: true, // Show a close icon to exit the tour
            },
            classes: "shepherd-theme-arrows", // Use a predefined theme
            scrollTo: { behavior: "smooth", block: "center" }, // Smooth scrolling
        },
    });

    // Define the steps for the tour
    tour.addStep({
        id: "welcome",
        text: "Welcome to your Finance Tracker Dashboard! This tour will guide you through the key features.",
        attachTo: {
            element: ".header", // Attach to the sidebar
            on: "right",
        },
        buttons: [
            {
                text: "Next",
                action: tour.next,
            },
        ],
    });

    tour.addStep({
        id: "add-transaction",
        text: "Click here to add a new transaction. You can specify details like description, amount, date, and category.",
        attachTo: {
            element: ".header button", // Attach to the "Add Transaction" button
            on: "left",
        },
        buttons: [
            {
                text: "Back",
                action: tour.back,
            },
            {
                text: "Next",
                action: tour.next,
            },
        ],
    });

    tour.addStep({
        id: "transactions-table",
        text: "This table displays your recent transactions. You can filter by description, date, and category.",
        attachTo: {
            element: "table", // Attach to the transactions table
            on: "bottom",
        },
        buttons: [
            {
                text: "Back",
                action: tour.back,
            },
            {
                text: "Next",
                action: tour.next,
            },
        ],
    });

    tour.addStep({
        id: "pie-chart",
        text: "This pie chart shows a breakdown of your transactions by category.",
        attachTo: {
            element: ".chart", // Attach to the pie chart section
            on: "top",
        },
        buttons: [
            {
                text: "Back",
                action: tour.back,
            },
            {
                text: "Next",
                action: tour.next,
            },
        ],
    });

    tour.addStep({
        id: "balance-chart",
        text: "This line chart shows your daily balance over time.",
        attachTo: {
            element: ".balance-chart", // Attach to the balance chart section
            on: "top",
        },
        buttons: [
            {
                text: "Back",
                action: tour.back,
            },
            {
                text: "Finish",
                action: tour.complete,
            },
        ],
    });

    tour.on("start", () => {
        createOverlay(); // Add the overlay when the tour starts
    });

    tour.on("complete", () => {
        removeOverlay(); // Remove the overlay when the tour completes
    });

    tour.on("cancel", () => {
        removeOverlay(); // Remove the overlay if the tour is canceled
    });

    return tour;
}