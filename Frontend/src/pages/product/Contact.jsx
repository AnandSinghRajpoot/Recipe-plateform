import React, { useState } from "react";
import toast from "react-hot-toast";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      toast.success("Message sent! We'll get back to you soon.");
      setFormData({ name: "", email: "", message: "" });
      setLoading(false);
    }, 1500);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="bg-surface font-body text-on-surface min-h-[calc(100vh-136px)] relative overflow-hidden flex items-center justify-center py-20 px-6">
      
      {/* Background Ambience Layers */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
        <div className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] rounded-full bg-primary/20 blur-[150px]"></div>
        <div className="absolute top-[60%] -right-[10%] w-[50%] h-[50%] rounded-full bg-secondary-container/20 blur-[120px]"></div>
      </div>

      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
        
        {/* Left Column: Contact Identity */}
        <div className="space-y-10">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest animate-fade-in">
              <span className="material-symbols-outlined text-xs">mail</span>
              Contact Protocol
            </div>
            <h1 className="font-headline text-5xl md:text-6xl font-black text-on-surface tracking-tighter leading-tight">
              Let's Start a <br />
              <span className="text-primary-fixed">Fresh Conversation.</span>
            </h1>
            <p className="text-on-surface-variant text-lg font-medium leading-relaxed max-w-md">
              Have a question, feedback, or a recipe idea? We’d love to hear from you — drop us a message below!
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="p-6 rounded-3xl bg-white/50 backdrop-blur-md border border-white shadow-sm group hover:border-primary/20 transition-all">
              <span className="material-symbols-outlined text-primary mb-4 p-3 bg-primary/5 rounded-2xl block w-fit">alternate_email</span>
              <h4 className="font-black text-on-surface mb-1">Email Support</h4>
              <p className="text-on-surface-variant font-bold text-sm">support@recipehub.com</p>
            </div>
            <div className="p-6 rounded-3xl bg-white/50 backdrop-blur-md border border-white shadow-sm group hover:border-primary/20 transition-all">
              <span className="material-symbols-outlined text-primary mb-4 p-3 bg-primary/5 rounded-2xl block w-fit">call</span>
              <h4 className="font-black text-on-surface mb-1">Phone Line</h4>
              <p className="text-on-surface-variant font-bold text-sm">+91 98765 43210</p>
            </div>
          </div>
        </div>

        {/* Right Column: Premium Contact Form */}
        <div className="w-full max-w-xl mx-auto lg:ml-auto">
          <div className="bg-white/80 backdrop-blur-3xl rounded-[3rem] p-8 md:p-12 shadow-[0_32px_64px_rgba(0,110,28,0.12)] border border-white relative overflow-hidden">
            
            <form className="space-y-8" onSubmit={handleSubmit}>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-2">Your Identity</label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">person</span>
                  <input 
                    type="text" name="name" value={formData.name} onChange={handleChange} required
                    className="w-full pl-14 pr-6 py-4 bg-surface-container-low border-2 border-transparent rounded-2xl focus:border-primary/30 focus:bg-white transition-all text-on-surface font-bold placeholder:text-outline-variant/30" 
                    placeholder="Jane Doe" 
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-2">Response Channel</label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">alternate_email</span>
                  <input 
                    type="email" name="email" value={formData.email} onChange={handleChange} required
                    className="w-full pl-14 pr-6 py-4 bg-surface-container-low border-2 border-transparent rounded-2xl focus:border-primary/30 focus:bg-white transition-all text-on-surface font-bold placeholder:text-outline-variant/30" 
                    placeholder="jane@example.com" 
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-2">Inquiry / Feedback</label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-5 top-6 text-outline group-focus-within:text-primary transition-colors">chat_bubble</span>
                  <textarea 
                    name="message" value={formData.message} onChange={handleChange} required rows={5}
                    className="w-full pl-14 pr-6 py-5 bg-surface-container-low border-2 border-transparent rounded-2xl focus:border-primary/30 focus:bg-white transition-all text-on-surface font-bold placeholder:text-outline-variant/30 resize-none" 
                    placeholder="Tell us what's on your mind..." 
                  />
                </div>
              </div>

              <button 
                type="submit" disabled={loading}
                className="w-full vitality-gradient text-white py-5 px-8 rounded-3xl font-black text-xl shadow-[0_24px_48px_rgba(0,110,28,0.2)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {loading ? (
                   <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Send Message</span>
                    <span className="material-symbols-outlined font-black">send</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}} />
    </div>
  );
};

export default Contact;
