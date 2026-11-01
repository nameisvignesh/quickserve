const option = (id, name, price, duration, description, includes = []) => ({ _id: id, name, price, duration, description, includes });

export const defaultServices = [
  {
    name: "Bathroom deep cleaning", category: "Cleaning", description: "Detailed bathroom cleaning for a fresher home.", price: 499, duration: "60–90 min", icon: "🧽",
    options: [option("bathroom-standard", "Standard bathroom clean", 499, "60–90 min", "Tiles, fixtures, floor and high-touch surfaces.", ["Tile and floor cleaning", "Wash basin and fixtures", "Mirror and glass wipe"]), option("bathroom-intensive", "Intensive bathroom clean", 799, "90–120 min", "A deeper clean for bathrooms that need extra attention.", ["Everything in standard", "Hard-water stain treatment", "Grout detailing"])]
  },
  {
    name: "Full home cleaning", category: "Cleaning", description: "A thorough clean for your living spaces.", price: 1499, duration: "3–4 hours", icon: "🏠",
    options: [option("home-basic", "Basic home cleaning", 1499, "3–4 hours", "Everyday cleaning for a well-kept home.", ["Dusting and vacuuming", "Floor mopping", "Kitchen and bathroom surface wipe"]), option("home-standard", "Standard home cleaning", 2299, "4–5 hours", "A detailed whole-home refresh.", ["Everything in basic", "Window and balcony cleaning", "Furniture and appliance exterior wipe"]), option("home-advanced", "Advanced home cleaning", 3499, "5–6 hours", "Our most detailed top-to-bottom clean.", ["Everything in standard", "Deep kitchen and bathroom clean", "Ceiling fan and difficult-reach dusting"])]
  },
  {
    name: "Sofa cleaning", category: "Cleaning", description: "Fabric-safe sofa cleaning for everyday mess.", price: 699, duration: "60 min", icon: "🛋️",
    options: [option("sofa-single", "Single sofa / recliner", 399, "30–45 min", "Fabric-safe cleaning for one seat.", ["Dry vacuum", "Spot treatment"]), option("sofa-3-seater", "3-seater sofa", 699, "60 min", "Deep cleaning for a standard 3-seater.", ["Dry vacuum", "Shampoo wash", "Odour treatment"]), option("sofa-large", "Large sofa set", 1199, "90 min", "Complete sofa-set cleaning.", ["Full set cleaning", "Shampoo wash", "Odour treatment"])]
  },
  {
    name: "Kitchen cleaning", category: "Cleaning", description: "Targeted kitchen cleaning for counters and surfaces.", price: 799, duration: "90 min", icon: "🍽️",
    options: [option("kitchen-basic", "Basic kitchen clean", 799, "60–90 min", "Counters, cabinets and floor surface clean.", ["Countertop wipe", "Cabinet exterior", "Floor mopping"]), option("kitchen-deep", "Deep kitchen clean", 1299, "2–3 hours", "A detailed clean for the entire kitchen.", ["Everything in basic", "Tile and backsplash detail", "Appliance exterior clean"]), option("kitchen-chimney", "Kitchen + chimney care", 1699, "3 hours", "Deep kitchen clean with chimney and hob service.", ["Everything in deep", "Chimney degreasing", "Hob cleaning"])]
  },
  {
    name: "AC service", category: "Appliance repair", description: "Choose the right service for your AC.", price: 299, duration: "45–90 min", icon: "❄️",
    options: [option("ac-checkup", "Basic AC checkup", 299, "30–45 min", "Inspection and performance check.", ["Cooling check", "Filter inspection", "Basic diagnosis"]), option("ac-cleaning", "AC cleaning service", 599, "60 min", "Standard split AC cleaning.", ["Filter wash", "Coil cleaning", "Drain check"]), option("ac-full", "Full AC service", 899, "90 min", "A complete service for better cooling.", ["Everything in cleaning", "Deep indoor unit clean", "Outdoor unit clean", "Gas pressure check"]), option("ac-water", "AC water-leak service", 499, "60–90 min", "Diagnosis and correction of common water leaks.", ["Drain pipe inspection", "Tray cleaning", "Leakage diagnosis"])]
  },
  {
    name: "Washing machine repair", category: "Appliance repair", description: "Diagnosis and repair visit for common issues.", price: 249, duration: "45–60 min", icon: "🧺",
    options: [option("wm-diagnosis", "Diagnosis visit", 249, "45–60 min", "Technician checks the issue and explains the repair.", ["Inspection", "Fault diagnosis", "Repair estimate"]), option("wm-service", "Routine service", 599, "60–90 min", "Cleaning and maintenance for smoother operation.", ["Drum and filter clean", "Inlet and outlet check", "Performance check"])]
  },
  {
    name: "Water purifier service", category: "Appliance repair", description: "Inspection and routine purifier maintenance.", price: 299, duration: "45 min", icon: "💧",
    options: [option("ro-checkup", "RO checkup", 299, "45 min", "Routine inspection for your purifier.", ["Filter inspection", "Leak check", "TDS check"]), option("ro-service", "RO service + filter care", 699, "60–90 min", "Deep service with filter health review.", ["Everything in checkup", "Membrane inspection", "Filter replacement estimate"])]
  },
  {
    name: "Electrician visit", category: "Electrician", description: "Pick the exact electrical help you need.", price: 199, duration: "30–60 min", icon: "💡",
    options: [option("electrician-tube", "Tube light installation", 199, "30–45 min", "Install or replace a tube light or LED batten.", ["Old fixture removal", "New fixture fitting", "Basic wiring check"]), option("electrician-fan", "Fan installation", 299, "45–60 min", "Ceiling or wall fan installation.", ["Mounting", "Wiring connection", "Safety check"]), option("electrician-switch", "Switch / socket repair", 199, "30–45 min", "Repair or replace common switches and sockets.", ["Fault check", "Replacement fitting", "Connection test"]), option("electrician-wiring", "Electrical inspection", 399, "60–90 min", "Find common wiring and load issues.", ["Circuit inspection", "Load check", "Repair recommendation"])]
  },
  {
    name: "Plumber visit", category: "Plumbing", description: "Choose the plumbing job you need help with.", price: 199, duration: "30–60 min", icon: "🔧",
    options: [option("plumber-tap", "Tap / faucet repair", 199, "30–45 min", "Repair or replace a leaking tap or faucet.", ["Leak diagnosis", "Washer or fitting change", "Flow test"]), option("plumber-leak", "Pipe leakage repair", 299, "45–60 min", "Locate and repair common pipe leaks.", ["Leak inspection", "Joint repair", "Pressure check"]), option("plumber-blockage", "Drain blockage removal", 349, "45–60 min", "Clear common sink and bathroom blockages.", ["Blockage diagnosis", "Manual clearing", "Flow test"]), option("plumber-install", "Bathroom fitting installation", 399, "60–90 min", "Install a new shower, tap or health faucet.", ["Fitting installation", "Seal check", "Water flow test"])]
  },
  {
    name: "Carpenter visit", category: "Carpentry", description: "Furniture adjustment and small carpentry work.", price: 249, duration: "30–60 min", icon: "🪚",
    options: [option("carpenter-furniture", "Furniture repair", 249, "30–60 min", "Fix hinges, handles and everyday furniture issues.", ["Inspection", "Minor repair", "Alignment check"]), option("carpenter-mount", "Drilling / mounting", 299, "30–60 min", "Mount shelves, mirrors, curtain rods and more.", ["Marking and drilling", "Wall plug fitting", "Level check"]), option("carpenter-door", "Door / window adjustment", 399, "60–90 min", "Improve alignment, hinges and closing.", ["Alignment check", "Hinge adjustment", "Latch check"])]
  },
  {
    name: "Smartwatch service", category: "Smart devices", description: "Repair and setup help for smartwatches and fitness bands.", price: 299, duration: "30–60 min", icon: "⌚",
    options: [option("smartwatch-checkup", "Smartwatch diagnosis", 299, "30–45 min", "Check charging, pairing, display and sensor issues.", ["Device inspection", "Bluetooth pairing check", "Repair estimate"]), option("smartwatch-setup", "Smartwatch setup", 399, "45–60 min", "Set up apps, notifications and health tracking.", ["Phone pairing", "App setup", "Notification setup"])]
  },
  {
    name: "Mobile phone service", category: "Smart devices", description: "At-home help for mobile setup, software and common issues.", price: 249, duration: "30–60 min", icon: "📱",
    options: [option("mobile-diagnosis", "Mobile diagnosis", 249, "30–45 min", "Identify common software, charging and connectivity issues.", ["Device check", "Software diagnosis", "Repair estimate"]), option("mobile-setup", "Phone setup and transfer", 499, "60–90 min", "Set up a new phone and move important data safely.", ["Account setup", "Data transfer", "App installation"])]
  },
  {
    name: "Smart TV service", category: "Smart devices", description: "Smart TV installation, setup and connectivity support.", price: 399, duration: "45–90 min", icon: "📺",
    options: [option("smart-tv-install", "Smart TV installation", 399, "45–60 min", "Mount or place your TV and connect the essential devices.", ["Stand or wall setup", "Cable connection", "Display check"]), option("smart-tv-setup", "Smart TV setup", 499, "60–90 min", "Configure Wi-Fi, apps, remote and streaming accounts.", ["Wi-Fi setup", "App installation", "Streaming check"])]
  },
  {
    name: "Smart home device setup", category: "Smart devices", description: "Connect smart speakers, cameras, plugs and home automation devices.", price: 349, duration: "45–90 min", icon: "🏠",
    options: [option("smart-home-single", "Single device setup", 349, "45–60 min", "Install and connect one smart home device.", ["Device pairing", "App setup", "Basic usage walkthrough"]), option("smart-home-pack", "Smart home device pack", 699, "90–120 min", "Set up up to three compatible smart devices.", ["Multi-device pairing", "Room setup", "Basic automation"])]
  }
];

export function seededServices() {
  return defaultServices.map((service, index) => ({
    ...service,
    _id: `demo-service-${index + 1}`,
    active: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }));
}
