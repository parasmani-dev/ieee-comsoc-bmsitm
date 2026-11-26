// Anchor positions use glTF coordinates in millimetres. Properties describe this
// illustrative assembly unless explicitly labelled as AD9361 reference data.
const radioParts = {
  radio: {
    title: "RF transceiver IC", group: "Radio core", at: [0,1,0],
    description: "Converts baseband samples into radio signals for transmission and converts received signals back into samples.",
    properties: [["Reference device","AD9361"],["Radio paths","2 transmit · 2 receive"],["Reference converters","12-bit ADCs and DACs"]],
    source: "https://www.analog.com/en/products/ad9361.html"
  },
  board: {
    title: "Printed circuit board", group: "Substrate", at: [0,0,21],
    description: "Copper traces carry signals and power between the components. The solder mask protects the copper and leaves solder pads exposed.",
    properties: [["Model outline","76 × 58 mm"],["Core material","FR-4 laminate"],["Mounting","Four through-holes"]]
  },
  ...Object.fromEntries(["TX1","TX2","RX1","RX2"].map((port,i) => [port.toLowerCase(), {
    title: port + " · SMA connector", group: "RF interface", at: [[-26,-9,9,26][i],5,31],
    description: i < 2 ? "Couples the transmit chain to a coaxial cable or antenna. The threaded shell provides the ground return." : "Couples an antenna or coaxial test cable to the receive chain. The centre contact carries the incoming RF signal.",
    properties: [["Channel",port],["Construction","Threaded coaxial socket"],["Insulator","PTFE dielectric"]]
  }])),
  socket: {
    title:"Mezzanine socket", group:"Digital interface", at:[-9,2,-22],
    description:"Connects the radio board to a carrier so that sample data and control signals can travel between boards.",
    properties:[["Style","Board-to-board"],["Contacts in model","Two rows of 48"],["Contact finish","Gold"]]
  },
  header: {
    title:"Pin header", group:"Digital interface", at:[17,5,-25],
    description:"Exposes a second connector for jumpers and test leads. Each metal post is isolated from its neighbours by a moulded base.",
    properties:[["Model layout","2 × 12 pins"],["Orientation","Vertical"],["Contact form","Square post"]]
  },
  clock: {
    title:"Reference oscillator", group:"Timing", at:[9,1,-11],
    description:"Provides a stable timing reference for frequency synthesis and digital sampling.",
    properties:[["Signal","Periodic reference"],["Package","Metal-lid surface mount"],["Key property","Frequency stability"]]
  },
  pll: {
    title:"RF synthesizer / PLL", group:"Timing", at:[23,1,-6],
    description:"A phase-locked loop compares a divided oscillator signal to a reference and corrects frequency drift.",
    properties:[["Input","Reference clock"],["Output","Tunable local oscillator"],["Function","Frequency synthesis"]]
  },
  lna: {
    title:"Low-noise amplifier", group:"Receive chain", at:[12,1,10],
    description:"Amplifies weak signals at the receiver input while limiting the extra noise introduced.",
    properties:[["Signal domain","Radio frequency"],["Role","Input gain"],["Key properties","Gain and noise figure"]]
  },
  balun: {
    title:"RF balun", group:"RF matching", at:[28,1,9],
    description:"Couples an unbalanced RF path to a balanced differential path between the connector and radio circuitry.",
    properties:[["Input / output","Single-ended ↔ differential"],["Component type","Passive RF network"],["Key property","Balance across the operating band"]]
  },
  converter: {
    title:"DC–DC converter", group:"Power supply", at:[-21,1,-4],
    description:"Switches energy through a storage element to convert the supply voltage to a rail used on the board.",
    properties:[["Input","DC supply"],["Output","Regulated DC rail"],["Key property","Conversion efficiency"]]
  },
  regulator: {
    title:"Voltage regulator", group:"Power supply", at:[-20,1,-15],
    description:"Holds a supply rail at a controlled voltage as the input or circuit load changes.",
    properties:[["Function","Rail regulation"],["Load","On-board electronics"],["Key properties","Output stability and noise"]]
  },
  flash: {
    title:"Flash memory", group:"Digital storage", at:[17,1,-17],
    description:"Provides non-volatile storage for information that must survive a power cycle.",
    properties:[["Storage","Non-volatile"],["Operation","Electrical erase and write"],["Package","Surface-mount IC"]]
  },
  capacitor: {
    title:"Chip capacitor", group:"Passive components", at:[-31,.6,-6.29],
    description:"Stores energy in an electric field. Near an IC it can supply short current pulses and bypass high-frequency noise.",
    properties:[["Construction","Ceramic dielectric"],["Use","Local decoupling"],["Measured in","Farads"]]
  },
  resistor: {
    title:"Chip resistor", group:"Passive components", at:[-31,.6,-12.74],
    description:"Sets currents and voltage ratios in bias, feedback and termination networks.",
    properties:[["Behaviour","Resists current flow"],["Mounting","Surface mount"],["Measured in","Ohms"]]
  },
  inductor: {
    title:"Chip inductor", group:"Passive components", at:[-29.08,.6,-11.45],
    description:"Stores energy in a magnetic field and opposes changes in current.",
    properties:[["Use","Filtering and matching"],["Mounting","Surface mount"],["Measured in","Henries"]]
  },
  powerInductor: {
    title:"Power inductor", group:"Power supply", at:[-30,1.9,-11],
    description:"Stores energy during each switching cycle of a converter and helps smooth its output current.",
    properties:[["Energy storage","Magnetic field"],["Package","Ferrite block"],["Key property","Saturation current"]]
  },
  bulk: {
    title:"Bulk capacitor", group:"Power supply", at:[29,3.5,-9],
    description:"Provides a local energy reserve for slower load changes on the supply rail.",
    properties:[["Use","Supply smoothing"],["Model package","Cylindrical can"],["Key properties","Capacitance and ESR"]]
  },
  led: {
    title:"Status LED", group:"Indicators", at:[-35,.75,13],
    description:"Converts a small forward current into visible light for a board-status indication.",
    properties:[["Component","Light-emitting diode"],["Connection","Polarised"],["Model indicator","Green lens"]]
  }
};
