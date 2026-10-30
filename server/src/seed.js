import "dotenv/config";
import mongoose from "mongoose";
import { Service } from "./models.js";
const services = [
  { name: "Bathroom deep cleaning", category: "Cleaning", description: "Detailed bathroom cleaning for a fresher home.", price: 499, duration: "60–90 min", icon: "🧽" },
  { name: "Full home cleaning", category: "Cleaning", description: "A thorough clean for your living spaces.", price: 1499, duration: "3–4 hours", icon: "🏠" },
  { name: "Sofa cleaning", category: "Cleaning", description: "Fabric-safe sofa cleaning for everyday mess.", price: 699, duration: "60 min", icon: "🛋️" },
  { name: "AC service", category: "Appliance repair", description: "Standard split AC service and inspection.", price: 599, duration: "60 min", icon: "❄️" },
  { name: "Washing machine repair", category: "Appliance repair", description: "Diagnosis and repair visit for common issues.", price: 249, duration: "45–60 min", icon: "🧺" },
  { name: "Electrician visit", category: "Electrician", description: "Home electrical inspection and small repairs.", price: 199, duration: "30–60 min", icon: "💡" },
  { name: "Plumber visit", category: "Plumbing", description: "Help with leaks, taps, and common plumbing issues.", price: 199, duration: "30–60 min", icon: "🔧" },
  { name: "Carpenter visit", category: "Carpentry", description: "Furniture adjustment and small carpentry work.", price: 249, duration: "30–60 min", icon: "🪚" },
  { name: "Kitchen cleaning", category: "Cleaning", description: "Targeted kitchen cleaning for counters and surfaces.", price: 799, duration: "90 min", icon: "🍽️" },
  { name: "Water purifier service", category: "Appliance repair", description: "Inspection and routine purifier maintenance.", price: 299, duration: "45 min", icon: "💧" }
];
await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/quickserve");
for (const s of services) await Service.updateOne({ name: s.name }, { $set: s }, { upsert: true });
console.log(`Seeded ${services.length} QuickServe services (Spa & Massage excluded).`);
await mongoose.disconnect();
