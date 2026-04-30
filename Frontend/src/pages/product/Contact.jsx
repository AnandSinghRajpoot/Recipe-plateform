import React, { useState } from "react";
import toast from "react-hot-toast";
import apiClient from "../../utils/apiClient";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
    message: ""
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await apiClient.post("/contact", formData);
      toast.success("Message sent! We'll get back to you soon.");
      setFormData({ name: "", email: "", address: "", message: "" });
    } catch (err) {
      // apiClient already handles toast for 500/network errors
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="bg-surface font-body text-on-surface min-h-[calc(100vh-136px)] relative overflow-hidden flex items-center justify-center py-20 px-6">
      {/* Background Ambience Layers */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-30">
        <div className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] rounded-full bg-primary/10 blur-[150px]"></div>
        <div className="absolute top-[60%] -right-[10%] w-[50%] h-[50%] rounded-full bg-secondary-container/10 blur-[120px]"></div>
      </div>

      <div className="max-w-2xl w-full relative z-10 text-center">
        <h1 className="font-headline text-5xl font-black text-on-surface mb-4">Contact Us</h1>
        <p className="text-on-surface-variant text-lg font-medium mb-12">
          Have questions or feedback? Send us a message and we'll get back to you.
        </p>
        
        <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl border border-outline-variant/20">
          <form className="space-y-6 text-left" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-wider text-on-surface-variant ml-1">Full Name</label>
              <input 
                type="text" name="name" value={formData.name} onChange={handleChange} required
                className="w-full px-6 py-4 bg-surface-container-low border border-outline-variant/30 rounded-2xl focus:border-primary focus:ring-1 focus:ring-primary transition-all text-on-surface font-bold" 
                placeholder="Your Name" 
              />
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-wider text-on-surface-variant ml-1">Email Address</label>
              <input 
                type="email" name="email" value={formData.email} onChange={handleChange} required
                className="w-full px-6 py-4 bg-surface-container-low border border-outline-variant/30 rounded-2xl focus:border-primary focus:ring-1 focus:ring-primary transition-all text-on-surface font-bold" 
                placeholder="email@example.com" 
              />
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-wider text-on-surface-variant ml-1">Physical Address (Optional)</label>
              <input 
                type="text" name="address" value={formData.address} onChange={handleChange}
                className="w-full px-6 py-4 bg-surface-container-low border border-outline-variant/30 rounded-2xl focus:border-primary focus:ring-1 focus:ring-primary transition-all text-on-surface font-bold" 
                placeholder="Your Address" 
              />
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-wider text-on-surface-variant ml-1">Message</label>
              <textarea 
                name="message" value={formData.message} onChange={handleChange} required rows={5}
                className="w-full px-6 py-4 bg-surface-container-low border border-outline-variant/30 rounded-2xl focus:border-primary focus:ring-1 focus:ring-primary transition-all text-on-surface font-bold resize-none" 
                placeholder="How can we help?" 
              />
            </div>

            <button 
              type="submit" disabled={loading}
              className="w-full bg-primary text-white py-5 px-8 rounded-[1.5rem] font-black text-lg shadow-lg hover:bg-primary-container hover:text-on-primary-container transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? (
                 <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Send Message</span>
                  <span className="material-symbols-outlined">send</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
