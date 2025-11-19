import React from "react";
import { FaEnvelope, FaPhoneAlt, FaInstagram, FaFacebook, FaTwitter } from "react-icons/fa";

const Contact = () => {
  return (
    <div className="min-h-screen bg-[#fffaf5] py-16 px-6 flex flex-col items-center">
      {/* Header Section */}
      <div className="text-center mb-10 max-w-2xl">
        <h1 className="text-4xl md:text-5xl font-bold text-[#2A3342] mb-3">
          Get in Touch
        </h1>
        <p className="text-gray-600 text-base">
          Have a question, feedback, or a recipe idea?  
          We’d love to hear from you — drop us a message below!
        </p>
      </div>

      {/* Contact Form */}
      <form className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md">
        <div className="mb-4">
          <label className="block text-sm font-semibold text-[#2A3342] mb-1">
            Name
          </label>
          <input
            type="text"
            placeholder="Your name"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-400"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-semibold text-[#2A3342] mb-1">
            Email
          </label>
          <input
            type="email"
            placeholder="you@example.com"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-400"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-[#2A3342] mb-1">
            Message
          </label>
          <textarea
            rows="4"
            placeholder="Write your message here..."
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-400 resize-none"
            required
          ></textarea>
        </div>

        <button
          type="submit"
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 rounded-lg transition"
        >
          Send Message
        </button>
      </form>

      {/* Contact Info */}
      <div className="text-center mt-10 text-gray-700">
        <p className="flex items-center justify-center gap-2 text-sm">
          <FaEnvelope className="text-orange-500" /> support@recipehub.com
        </p>
        <p className="flex items-center justify-center gap-2 text-sm mt-1">
          <FaPhoneAlt className="text-orange-500" /> +91 98765 43210
        </p>

      </div>
    </div>
  );
};

export default Contact;

