const tourPlaces = [
    {
        img: "/img/Home/HaLong.jpg",
        alt: "Ha Long image",
        title: "Ha Long Bay",
        description: "Ha Long Bay captivates with emerald waters and towering limestone cliffs.",
        link: "/tours?location=Ha Long Bay&page=1"
    },

    {
        img: "/img/Home/Huế.jpg",
        alt: "Hue image",
        title: "Hue ancient capital",
        description: "Hue Ancient Capital stands out with its ancient architecture and rich cultural heritage.",
        link: "/tours?location=Hue&page=1"
    },
    {
        img: "/img/Home/TPHCM.jpg",
        alt: "Ho Chi Minh City image",
        title: "Ho Chi Minh City",
        description: "Ho Chi Minh City is vibrant with a dynamic lifestyle and diverse cultural features.",
        link: "/tours?location=Ho Chi Minh City&page=1"
    }
];

const services = [
    {
        img: "/img/Home/item_1_choose.png",
        title: "Best Service",
        description: "Our service is reliable and convenient, our service is quality."
    },
    {
        img: "/img/Home/item_2_choose.png",
        title: "Price Guarantee",
        description: "Our service is reliable and convenient, our service is quality."
    },
    {
        img: "/img/Home/item_3_choose.png",
        title: "Achievement",
        description: "Our service is reliable and convenient, our service is quality."
    }
];


const customerFeedbacks = [
    {
        img: "/img/Home/PTD.jpg",
        name: "Customer Name 1",
        role: "Traveler",
        feedback: "This is a sample feedback from the client about the service they received."
    },
    {
        img: "/img/Home/PTD.jpg",
        name: "Customer Name 2",
        role: "Traveler",
        feedback: "This is a sample feedback from the client about the service they received."
    },
    {
        img: "/img/Home/PTD.jpg",
        name: "Customer Name 3",
        role: "Traveler",
        feedback: "This is a sample feedback from the client about the service they received."
    },
    {
        img: "/img/Home/PTD.jpg",
        name: "Customer Name 4",
        role: "Traveler",
        feedback: "This is a sample feedback from the client about the service they received."
    },
    {
        img: "/img/Home/PTD.jpg",
        name: "Customer Name 5",
        role: "Traveler",
        feedback: "This is a sample feedback from the client about the service they received."
    },
    {
        img: "/img/Home/PTD.jpg",
        name: "Customer Name 6",
        role: "Traveler",
        feedback: "This is a sample feedback from the client about the service they received."
    }
];


const toursContainer = document.getElementById('tours-container'); // ID cho phần chứa các tour
const servicesContainer = document.getElementById('services-container'); // ID cho phần chứa các dịch vụ
const feedbackContainer = document.getElementById('feedback-container'); // ID cho phần chứa phản hồi

// Tạo HTML cho các địa điểm du lịch
tourPlaces.forEach(place => {
    const link = document.createElement('a');
    link.href = place.link;
    link.className = "flex flex-col text-left flex-1 transition transform hover:scale-105 hover:shadow-[0_35px_40px_-15px_rgba(0,0,0,0.3)] py-4 px-4";
    const img = document.createElement('img');
    img.src = place.img;
    img.alt = place.alt;
    img.className = "w-auto h-56 object-cover rounded-lg mb-2";

    const title = document.createElement('h4');
    title.className = "font-bold text-xl mt-5";
    title.textContent = place.title;

    const description = document.createElement('p');
    description.className = "text-xs text-gray-500 mt-3";
    description.textContent = place.description;

    link.appendChild(img);
    link.appendChild(title);
    link.appendChild(description);
    toursContainer.appendChild(link);
});

// Tạo HTML cho các dịch vụ
services.forEach(service => {
    const serviceDiv = document.createElement('div');
    serviceDiv.className = "flex flex-col bg-white py-4 min-w-64 w-64 p-4 shadow rounded-lg";

    const img = document.createElement('img');
    img.src = service.img;
    img.alt = service.title;
    img.className = "w-16 h-16 object-cover mb-2 rounded-lg";

    const title = document.createElement('h5');
    title.className = "mt-5 font-bold";
    title.textContent = service.title;

    const description = document.createElement('p');
    description.className = "mt-3 text-xs text-gray-500";
    description.textContent = service.description;

    const learnMoreLink = document.createElement('a');
    learnMoreLink.href = "#";
    learnMoreLink.className = "mt-4 text-blue-500 text-xs";
    learnMoreLink.textContent = "Learn more";

    serviceDiv.appendChild(img);
    serviceDiv.appendChild(title);
    serviceDiv.appendChild(description);
    serviceDiv.appendChild(learnMoreLink);
    servicesContainer.appendChild(serviceDiv);
});

customerFeedbacks.forEach(feedback => {
    const feedbackDiv = document.createElement('div');
    feedbackDiv.className = "flex flex-col bg-white rounded-lg py-4 px-8 items-center min-w-64 w-64 h-80 shadow-lg";

    const img = document.createElement('img');
    img.src = feedback.img;
    img.alt = `ava_${feedback.name.replace(/\s+/g, '_')}`; // Tạo alt cho img
    img.className = "w-16 h-16 object-cover rounded-full";

    const name = document.createElement('h4');
    name.className = "font-semibold text-lg";
    name.textContent = feedback.name;

    const role = document.createElement('p');
    role.className = "text-sm text-gray-500";
    role.textContent = feedback.role;

    const feedbackText = document.createElement('p');
    feedbackText.className = "mt-8 text-gray-600 text-sm";
    feedbackText.textContent = feedback.feedback;

    feedbackDiv.appendChild(img);
    feedbackDiv.appendChild(name);
    feedbackDiv.appendChild(role);
    feedbackDiv.appendChild(feedbackText);
    feedbackContainer.appendChild(feedbackDiv);
});

function clickButton() {
    window.location.href = "./src/html/Login.html";
}