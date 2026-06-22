export const capabilities = [
  {
    id: "engineering",
    title: "Engineering",
    subtitle: "Process & Mechanical Design",
    description: "Multidisciplinary simulation, thermal calculations, and mechanical engineering for process plants.",
    subcategories: [
      {
        name: "Process Engineering",
        items: [
          "Process simulation, P&ID drafting and design",
          "Flare network analysis, relief valve sizing & audits",
          "Pipeline hydraulics and steady-state flow analysis",
          "Storage terminal design for LNG, Propane & Butane"
        ]
      },
      {
        name: "Mechanical Engineering",
        items: [
          "Static equipment calculation (PV Elite, AME Tank)",
          "Design validation for brownfield revamp & retrofit",
          "Rotary equipment specifications and adequacy studies",
          "Factory Acceptance Test (FAT) witness support"
        ]
      },
      {
        name: "HSE / Technical Safety",
        items: [
          "HAZID, ENVID, HAZOP, eHAZOP & LOPA studies",
          "SIL Assessment, QRA, FERA & Consequence Analysis",
          "Fire Protection (Active/Passive) & Loss Prevention Design",
          "PHSER and Pre-Startup Safety Reviews (PSSR)"
        ]
      }
    ]
  },
  {
    id: "infrastructure",
    title: "Infrastructure",
    subtitle: "Civil & Piping Systems",
    description: "Structural engineering, composite layouts, and piping stress analysis for heavy plant infrastructure.",
    subcategories: [
      {
        name: "Civil & Structural",
        items: [
          "Structural design for pipe racks, tech structures, and PEBs",
          "Civil design with static & dynamic foundation analysis",
          "Underground utilities and drainage system layout",
          "Design using STAAD-Pro, MAT 3D, Tekla, and Revit"
        ]
      },
      {
        name: "Piping & Pipeline",
        items: [
          "3D modeling using PDMS, E3D, PDS, and S3D",
          "Piping stress analysis (Caesar II, AutoPipe)",
          "Isometric extraction for pig launchers & receivers",
          "Pipe support and anchor block design & selection"
        ]
      }
    ]
  },
  {
    id: "systems",
    title: "Systems",
    subtitle: "Electrical & Instrumentation",
    description: "Design of complete electrical distribution networks, automation grids, and telecommunication systems.",
    subcategories: [
      {
        name: "Electrical Systems",
        items: [
          "Power system studies and electrical load analysis (ETAP)",
          "Equipment & cable sizing, lightning protection design",
          "Hazardous area classification layouts",
          "Electrical modeling and technical design reviews"
        ]
      },
      {
        name: "Instruments & Telecom",
        items: [
          "Control system architecture (DCS/PLC) and narratives",
          "Fire & Gas (F&G), SCADA, and automation design",
          "CCTV, access control, and industrial telecom setups",
          "System modeling and Intools (SPI) integration"
        ]
      }
    ]
  },
  {
    id: "digital",
    title: "Digital",
    subtitle: "AI & Engineering Software Suite",
    description: "AI-assisted engineering command centers, predictive maintenance twins, and comprehensive CAD/FEA suites.",
    subcategories: [
      {
        name: "AI Engineering Operations",
        items: [
          "Smart design reviews & auto document checkers",
          "P&ID Automated Reviews & Risk Assessment scans",
          "CMMS asset register optimization (SAP/MAXIMO)",
          "Predictive maintenance & RAM reliability twins"
        ]
      },
      {
        name: "Software Ecosystem",
        items: [
          "Process: Hysis, Olga, Honeywell, Unisim, Pipenet",
          "Design: PDMS, E3D, SP3D, Plant 3D, AutoCAD",
          "Structural/FEA: STAAD Pro, SACS, Tekla, PV Elite, Ansys",
          "Electrical/Control: ETAP, SPI (Intools), Digsilent"
        ]
      }
    ]
  }
];
