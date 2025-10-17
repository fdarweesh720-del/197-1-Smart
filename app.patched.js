
// === Injected by Assistant: SO3 limit resolver by cement TYPE (EN 197-1) ===
// type example: "CEM II/B-T", class example: "42.5 R"
async function getSO3Limit(type, strengthClass) {
    const req = await loadChemicalRequirements();
    if (!req) return null;
    const t = String(type || '').toUpperCase().replace('\u00A0',' ').trim();
    const classKey = String(strengthClass || '').replace('.', '_').replace(' ', '_').toUpperCase(); // e.g., "42_5_R"
    if (t.startsWith('CEM I') && req.CEM_I) {
        // Map specific class keys if provided, else default 3.5/4.0 logic
        const byClass = req.CEM_I.sulfate_content || {};
        return byClass[classKey] || byClass['42_5_R'] || '≤ 4.0%';
    }
    if (t.startsWith('CEM III') && req.CEM_III) {
        const byClass = req.CEM_III.sulfate_content || {};
        return byClass.all_classes || '≤ 4.5%';
    }
    if (t.startsWith('CEM II') && req.CEM_II) {
        const byClass = req.CEM_II.sulfate_content || {};
        // Special cases for CEM II/B-T and CEM II/B-M with T>20
        if (t.includes('CEM II/B-T') || (t.includes('CEM II/B-M') && /T\s*\>\s*20/i.test(t))) {
            const spec = req.CEM_II.special_cases || {};
            return spec.CEM_II_B_T || spec.CEM_II_B_M_with_T_over_20 || '≤ 4.5% SO3 (all classes)';
        }
        return byClass[classKey] || '≤ 4.0%';
    }
    if (t.startsWith('CEM IV') && req.CEM_IV) {
        const byClass = req.CEM_IV.sulfate_content || {};
        return byClass[classKey] || '≤ 4.0%';
    }
    if (t.startsWith('CEM V') && req.CEM_V) {
        const byClass = req.CEM_V.sulfate_content || {};
        return byClass[classKey] || '≤ 4.0%';
    }
    return null;
}


// === Injected by Assistant: Load corrected chemical requirements JSON ===
async function loadChemicalRequirements() {
    try {
        const resp = await fetch('corrected_chemical_requirements.json');
        if (!resp.ok) throw new Error('Failed to load chemical requirements JSON');
        const data = await resp.json();
        return data.chemical_requirements_by_type_and_class || data;
    } catch (e) {
        console.error('Error loading chemical requirements:', e);
        return null;
    }
}


// === Injected by Assistant: Strength class rules (EN 197-1) ===
function normalizeStrengthVariants(variant) {
    // Map lowercase/typos to uppercase canonical keys
    if(!variant) return variant;
    const v = String(variant).trim().toUpperCase();
    return (v === 'L' || v === 'N' || v === 'R') ? v : variant;
}
function allowedStrengthVariantsForType(type) {
    const t = String(type || '').toUpperCase();
    if (t.startsWith('CEM III')) return ['L','N','R']; // but UI must avoid CEM III-L + R combo conflicts in datasets
    return ['N','R'];
}
function isLAllowed(type) {
    return String(type || '').toUpperCase().startsWith('CEM III');
}

// Application Data - Original Structure Preserved
const cementData = {
    // Separate strength classes with ALL variants (N, R, L)
    strengthClasses: {
        "32.5": {
            variants: {
                L: {
                    name: "Low early strength",
                    early_days: 7,
                    early_min: 12.0,
                    standard_min: 32.5,
                    standard_max: 52.5,
                    setting_time: 75,
                    applications: ["Mass concrete", "Dams", "Large foundations"]
                },
                N: {
                    name: "Normal early strength",
                    early_days: 7,
                    early_min: 16.0,
                    standard_min: 32.5,
                    standard_max: 52.5,
                    setting_time: 75,
                    applications: ["General construction", "Masonry work", "Non-structural elements"]
                },
                R: {
                    name: "Rapid early strength",
                    early_days: 2,
                    early_min: 10.0,
                    standard_min: 32.5,
                    standard_max: 52.5,
                    setting_time: 75,
                    applications: ["Fast construction", "Early demolding", "Rapid strength gain"]
                }
            }
        },
        "42.5": {
            variants: {
                L: {
                    name: "Low early strength",
                    early_days: 7,
                    early_min: 16.0,
                    standard_min: 42.5,
                    standard_max: 62.5,
                    setting_time: 60,
                    applications: ["Mass concrete structures", "Thermal mass", "Low heat applications"]
                },
                N: {
                    name: "Normal early strength",
                    early_days: 2,
                    early_min: 10.0,
                    standard_min: 42.5,
                    standard_max: 62.5,
                    setting_time: 60,
                    applications: ["Structural concrete", "Precast elements", "General construction"]
                },
                R: {
                    name: "Rapid early strength",
                    early_days: 2,
                    early_min: 20.0,
                    standard_min: 42.5,
                    standard_max: 62.5,
                    setting_time: 60,
                    applications: ["Fast construction", "Precast industry", "Quick turnover projects"]
                }
            }
        },
        "52.5": {
            variants: {
                L: {
                    name: "Low early strength",
                    early_days: 2,
                    early_min: 10.0,
                    standard_min: 52.5,
                    standard_max: null,
                    setting_time: 45,
                    applications: ["High-performance mass concrete", "Low heat high strength"]
                },
                N: {
                    name: "Normal early strength",
                    early_days: 2,
                    early_min: 20.0,
                    standard_min: 52.5,
                    standard_max: null,
                    setting_time: 45,
                    applications: ["High-strength concrete", "Structural applications", "Infrastructure"]
                },
                R: {
                    name: "Rapid early strength",
                    early_days: 2,
                    early_min: 30.0,
                    standard_min: 52.5,
                    standard_max: null,
                    setting_time: 45,
                    applications: ["Rapid construction", "Prestressed concrete", "Fast-track projects"]
                }
            }
        }
    },
    
    // Cement TYPES only - DATA RESTORED TO ORIGINAL STATE
    types: [
        {
            id: 'cem1',
            name: 'CEM I',
            family: 'CEM I',
            category: 'common',
            clinker: '95-100%',
            description: 'Pure Portland cement with highest clinker content for structural applications',
            applications: ['Structural concrete', 'High early strength applications', 'General construction'],
            composition: { clinker: 100 },
            chemical_requirements: {
                loss_on_ignition: "≤ 5.0%",
                insoluble_residue: "≤ 5.0%",
                sulfate_32_5N_32_5R_42_5N: "≤ 3.5%",
                sulfate_42_5R_52_5N_52_5R: "≤ 4.0%",
                chloride: "≤ 0.10%"
            },
            available_strength_classes: ["32.5", "42.5", "52.5"]
        },
        {
            id: 'cem2-a-s',
            name: 'CEM II/A-S',
            family: 'CEM II',
            category: 'common',
            clinker: '80-94%',
            additive: '6-20% Slag',
            description: 'Portland-slag cement (6-20%)',
            applications: ['General construction', 'Mass concrete', 'Marine environments'],
            composition: { clinker: 85, slag: 15 },
            chemical_requirements: {
                sulfate_content: "varies by strength class",
                chloride: "≤ 0.10%"
            },
            available_strength_classes: ["32.5", "42.5", "52.5"]
        },
        {
            id: 'cem2-b-s',
            name: 'CEM II/B-S',
            family: 'CEM II',
            category: 'common',
            clinker: '65-79%',
            additive: '21-35% Slag',
            description: 'Portland-slag cement (21-35%)',
            applications: ['Structural concrete', 'Durable construction', 'Sulfate environments'],
            composition: { clinker: 70, slag: 30 },
            chemical_requirements: {
                sulfate_content: "varies by strength class",
                chloride: "≤ 0.10%"
            },
            available_strength_classes: ["32.5", "42.5", "52.5"]
        },
        {
            id: 'cem2-a-d',
            name: 'CEM II/A-D',
            family: 'CEM II',
            category: 'common',
            clinker: '90-94%',
            additive: '6-10% Silica fume',
            description: 'Portland-silica fume',
            applications: ['High-performance concrete', 'Ultra-high strength', 'Reduced permeability'],
            composition: { clinker: 92, silicaFume: 8 },
            chemical_requirements: {
                sulfate_content: "varies by strength class",
                chloride: "≤ 0.10%"
            },
            available_strength_classes: ["32.5", "42.5", "52.5"]
        },
        {
            id: 'cem2-a-p',
            name: 'CEM II/A-P',
            family: 'CEM II',
            category: 'common',
            clinker: '80-94%',
            additive: '6-20% Natural pozzolana',
            description: 'Portland-natural pozzolana (6-20%)',
            applications: ['Aggressive environments', 'Mass concrete', 'Long-term durability'],
            composition: { clinker: 85, pozzolan: 15 },
            chemical_requirements: {
                sulfate_content: "varies by strength class",
                chloride: "≤ 0.10%"
            },
            available_strength_classes: ["32.5", "42.5", "52.5"]
        },
        {
            id: 'cem2-b-p',
            name: 'CEM II/B-P',
            family: 'CEM II',
            category: 'common',
            clinker: '65-79%',
            additive: '21-35% Natural pozzolana',
            description: 'Portland-natural pozzolana (21-35%)',
            applications: ['Harsh environments', 'Mass concrete', 'Durability focus'],
            composition: { clinker: 70, pozzolan: 30 },
            chemical_requirements: {
                sulfate_content: "varies by strength class",
                chloride: "≤ 0.10%"
            },
            available_strength_classes: ["32.5", "42.5", "52.5"]
        },
        {
            id: 'cem2-a-q',
            name: 'CEM II/A-Q',
            family: 'CEM II',
            category: 'common',
            clinker: '80-94%',
            additive: '6-20% Calcined pozzolana',
            description: 'Portland-calcined pozzolana (6-20%)',
            applications: ['Chemical resistance', 'Hot climates', 'Mass concrete'],
            composition: { clinker: 85, pozzolan: 15 },
            chemical_requirements: {
                sulfate_content: "varies by strength class",
                chloride: "≤ 0.10%"
            },
            available_strength_classes: ["32.5", "42.5", "52.5"]
        },
        {
            id: 'cem2-b-q',
            name: 'CEM II/B-Q',
            family: 'CEM II',
            category: 'common',
            clinker: '65-79%',
            additive: '21-35% Calcined pozzolana',
            description: 'Portland-calcined pozzolana (21-35%)',
            applications: ['Severe exposure', 'Chemical resistance', 'Infrastructure'],
            composition: { clinker: 70, pozzolan: 30 },
            chemical_requirements: {
                sulfate_content: "varies by strength class",
                chloride: "≤ 0.10%"
            },
            available_strength_classes: ["32.5", "42.5", "52.5"]
        },
        {
            id: 'cem2-a-v',
            name: 'CEM II/A-V',
            family: 'CEM II',
            category: 'common',
            clinker: '80-94%',
            additive: '6-20% Siliceous fly ash',
            description: 'Portland-siliceous fly ash (6-20%)',
            applications: ['General construction', 'Sustainable building', 'Long-term projects'],
            composition: { clinker: 85, flyAsh: 15 },
            chemical_requirements: {
                sulfate_content: "varies by strength class",
                chloride: "≤ 0.10%"
            },
            available_strength_classes: ["32.5", "42.5", "52.5"]
        },
        {
            id: 'cem2-b-v',
            name: 'CEM II/B-V',
            family: 'CEM II',
            category: 'common',
            clinker: '65-79%',
            additive: '21-35% Siliceous fly ash',
            description: 'Portland-siliceous fly ash (21-35%)',
            applications: ['Mass concrete', 'Infrastructure', 'Eco-friendly construction'],
            composition: { clinker: 70, flyAsh: 30 },
            chemical_requirements: {
                sulfate_content: "varies by strength class",
                chloride: "≤ 0.10%"
            },
            available_strength_classes: ["32.5", "42.5", "52.5"]
        },
        {
            id: 'cem2-a-w',
            name: 'CEM II/A-W',
            family: 'CEM II',
            category: 'common',
            clinker: '80-94%',
            additive: '6-20% Calcareous fly ash',
            description: 'Portland-calcareous fly ash (6-20%)',
            applications: ['Infrastructure', 'Mass concrete', 'Sustainable construction'],
            composition: { clinker: 85, flyAsh: 15 },
            chemical_requirements: {
                sulfate_content: "varies by strength class",
                chloride: "≤ 0.10%"
            },
            available_strength_classes: ["32.5", "42.5", "52.5"]
        },
        {
            id: 'cem2-b-w',
            name: 'CEM II/B-W',
            family: 'CEM II',
            category: 'common',
            clinker: '65-79%',
            additive: '21-35% Calcareous fly ash',
            description: 'Portland-calcareous fly ash (21-35%)',
            applications: ['Mass concrete', 'Long-term applications', 'Sustainable projects'],
            composition: { clinker: 70, flyAsh: 30 },
            chemical_requirements: {
                sulfate_content: "varies by strength class",
                chloride: "≤ 0.10%"
            },
            available_strength_classes: ["32.5", "42.5", "52.5"]
        },
        {
            id: 'cem2-a-t',
            name: 'CEM II/A-T',
            family: 'CEM II',
            category: 'common',
            clinker: '80-94%',
            additive: '6-20% Burnt shale',
            description: 'Portland-burnt shale (6-20%)',
            applications: ['General construction', 'Regional availability', 'Cost-effective'],
            composition: { clinker: 85, burntShale: 15 },
            chemical_requirements: {
                sulfate_content: "varies by strength class",
                chloride: "≤ 0.10%"
            },
            available_strength_classes: ["32.5", "42.5", "52.5"]
        },
        {
            id: 'cem2-b-t',
            name: 'CEM II/B-T',
            family: 'CEM II',
            category: 'common',
            clinker: '65-79%',
            additive: '21-35% Burnt shale',
            description: 'Portland-burnt shale (21-35%)',
            applications: ['Local construction', 'Regional projects', 'Economic construction'],
            composition: { clinker: 70, burntShale: 30 },
            chemical_requirements: {
                sulfate_content: "varies by strength class",
                chloride: "≤ 0.10%"
            },
            available_strength_classes: ["32.5", "42.5", "52.5"]
        },
        {
            id: 'cem2-a-l',
            name: 'CEM II/A-L',
            family: 'CEM II',
            category: 'common',
            clinker: '80-94%',
            additive: '6-20% Limestone L',
            description: 'Portland-limestone L (6-20%)',
            applications: ['General construction', 'Architectural concrete', 'Precast elements'],
            composition: { clinker: 85, limestone: 15 },
            chemical_requirements: {
                sulfate_content: "varies by strength class",
                chloride: "≤ 0.10%"
            },
            available_strength_classes: ["32.5", "42.5", "52.5"]
        },
        {
            id: 'cem2-b-l',
            name: 'CEM II/B-L',
            family: 'CEM II',
            category: 'common',
            clinker: '65-79%',
            additive: '21-35% Limestone L',
            description: 'Portland-limestone L (21-35%)',
            applications: ['Mass concrete', 'Non-structural elements', 'Sustainable construction'],
            composition: { clinker: 70, limestone: 30 },
            chemical_requirements: {
                sulfate_content: "varies by strength class",
                chloride: "≤ 0.10%"
            },
            available_strength_classes: ["32.5", "42.5", "52.5"]
        },
        {
            id: 'cem2-a-ll',
            name: 'CEM II/A-LL',
            family: 'CEM II',
            category: 'common',
            clinker: '80-94%',
            additive: '6-20% Limestone LL',
            description: 'Portland-limestone LL (6-20%)',
            applications: ['General construction', 'Cost-effective solutions', 'Regional use'],
            composition: { clinker: 85, limestone: 15 },
            chemical_requirements: {
                sulfate_content: "varies by strength class",
                chloride: "≤ 0.10%"
            },
            available_strength_classes: ["32.5", "42.5", "52.5"]
        },
        {
            id: 'cem2-b-ll',
            name: 'CEM II/B-LL',
            family: 'CEM II',
            category: 'common',
            clinker: '65-79%',
            additive: '21-35% Limestone LL',
            description: 'Portland-limestone LL (21-35%)',
            applications: ['Mass concrete applications', 'Economic construction', 'Large projects'],
            composition: { clinker: 70, limestone: 30 },
            chemical_requirements: {
                sulfate_content: "varies by strength class",
                chloride: "≤ 0.10%"
            },
            available_strength_classes: ["32.5", "42.5", "52.5"]
        },
        {
            id: 'cem2-a-m',
            name: 'CEM II/A-M',
            family: 'CEM II',
            category: 'common',
            clinker: '80-88%',
            additive: '12-20% Mixed constituents',
            description: 'Portland-composite (12-20%)',
            applications: ['Versatile applications', 'Mixed exposure', 'General purpose'],
            composition: { clinker: 85, mixed: 15 },
            chemical_requirements: {
                sulfate_content: "varies by strength class",
                chloride: "≤ 0.10%"
            },
            available_strength_classes: ["32.5", "42.5", "52.5"]
        },
        {
            id: 'cem2-b-m',
            name: 'CEM II/B-M',
            family: 'CEM II',
            category: 'common',
            clinker: '65-79%',
            additive: '21-35% Mixed constituents',
            description: 'Portland-composite (21-35%)',
            applications: ['Complex environments', 'Multi-purpose use', 'Sustainable construction'],
            composition: { clinker: 70, mixed: 30 },
            chemical_requirements: {
                sulfate_content: "varies by strength class",
                chloride: "≤ 0.10%"
            },
            available_strength_classes: ["32.5", "42.5", "52.5"]
        },
        {
            id: 'cem3-a',
            name: 'CEM III/A',
            family: 'CEM III',
            category: 'common',
            clinker: '35-64%',
            additive: '36-65% Slag',
            description: 'Blast furnace cement with 36-65% slag content',
            applications: ['Marine structures', 'Mass concrete', 'Chemical resistance'],
            composition: { clinker: 50, slag: 50 },
            chemical_requirements: {
                loss_on_ignition: "≤ 5.0%",
                insoluble_residue: "≤ 5.0%",
                sulfate_content: "up to 4.5%",
                chloride: "≤ 0.10%"
            },
            available_strength_classes: ["32.5", "42.5", "52.5"]
        },
        {
            id: 'cem3-b',
            name: 'CEM III/B',
            family: 'CEM III',
            category: 'common',
            clinker: '20-34%',
            additive: '66-80% Slag',
            description: 'High slag content cement for enhanced durability',
            applications: ['Aggressive environments', 'Sulfate resistance', 'Long-term strength'],
            composition: { clinker: 25, slag: 75 },
            chemical_requirements: {
                loss_on_ignition: "≤ 5.0%",
                insoluble_residue: "≤ 5.0%",
                sulfate_content: "up to 4.5%",
                chloride: "≤ 0.10%"
            },
            available_strength_classes: ["32.5", "42.5", "52.5"]
        },
        {
            id: 'cem3-c',
            name: 'CEM III/C',
            family: 'CEM III',
            category: 'common',
            clinker: '5-19%',
            additive: '81-95% Slag',
            description: 'Very high slag content for maximum chemical resistance',
            applications: ['Highly aggressive environments', 'Industrial applications', 'Waste containment'],
            composition: { clinker: 15, slag: 85 },
            chemical_requirements: {
                loss_on_ignition: "≤ 5.0%",
                insoluble_residue: "≤ 5.0%",
                sulfate_content: "up to 4.5%",
                chloride: "≤ 0.10%"
            },
            available_strength_classes: ["32.5", "42.5", "52.5"]
        },
        {
            id: 'cem4-a',
            name: 'CEM IV/A',
            family: 'CEM IV',
            category: 'common',
            clinker: '65-89%',
            additive: '11-35% Pozzolanic materials',
            description: 'Pozzolanic cement with 11-35% pozzolanic materials',
            applications: ['Hot climates', 'Mass concrete', 'Alkali-silica reaction mitigation'],
            composition: { clinker: 75, pozzolan: 25 },
            chemical_requirements: {
                sulfate_content: "varies by strength class",
                chloride: "≤ 0.10%",
                pozzolanicity_test: "must satisfy"
            },
            available_strength_classes: ["32.5", "42.5", "52.5"]
        },
        {
            id: 'cem4-b',
            name: 'CEM IV/B',
            family: 'CEM IV',
            category: 'common',
            clinker: '45-64%',
            additive: '36-55% Pozzolanic materials',
            description: 'High pozzolan content for enhanced durability',
            applications: ['Severe exposure conditions', 'Thermal mass', 'Sustainable construction'],
            composition: { clinker: 55, pozzolan: 45 },
            chemical_requirements: {
                sulfate_content: "varies by strength class",
                chloride: "≤ 0.10%",
                pozzolanicity_test: "must satisfy"
            },
            available_strength_classes: ["32.5", "42.5", "52.5"]
        },
        {
            id: 'cem5-a',
            name: 'CEM V/A',
            family: 'CEM V',
            category: 'common',
            clinker: '40-64%',
            additive: '18-30% Slag + 18-30% Pozzolan/Fly ash',
            description: 'Composite cement with slag and pozzolan (18-30% each)',
            applications: ['Multi-exposure environments', 'Sustainable construction', 'Long-term durability'],
            composition: { clinker: 50, slag: 25, pozzolan: 25 },
            chemical_requirements: {
                sulfate_content: "varies by strength class",
                chloride: "≤ 0.10%"
            },
            available_strength_classes: ["32.5", "42.5", "52.5"]
        },
        {
            id: 'cem5-b',
            name: 'CEM V/B',
            family: 'CEM V',
            category: 'common',
            clinker: '20-38%',
            additive: '31-50% Slag + 31-50% Pozzolan/Fly ash',
            description: 'High replacement composite cement for extreme durability',
            applications: ['Highly aggressive environments', 'Infrastructure', 'Waste management'],
            composition: { clinker: 30, slag: 35, pozzolan: 35 },
            chemical_requirements: {
                sulfate_content: "varies by strength class",
                chloride: "≤ 0.10%"
            },
            available_strength_classes: ["32.5", "42.5", "52.5"]
        },
        {
            id: 'cem1-sr0',
            name: 'CEM I-SR 0',
            family: 'CEM I-SR',
            category: 'sulfate',
            clinker: '95-100%',
            description: 'Sulfate resisting Portland cement with C₃A = 0% for maximum sulfate resistance',
            applications: ['Severe sulfate environments', 'Seawater exposure', 'Chemical industry'],
            composition: { clinker: 100 },
            chemical_requirements: {
                c3a_limit: "C₃A = 0%",
                sulfate_32_5: "≤ 3.0%",
                sulfate_42_5_52_5: "≤ 3.5%",
                chloride: "≤ 0.10%",
                loss_on_ignition: "≤ 5.0%",
                insoluble_residue: "≤ 5.0%"
            },
            available_strength_classes: ["32.5", "42.5", "52.5"]
        },
        {
            id: 'cem1-sr3',
            name: 'CEM I-SR 3',
            family: 'CEM I-SR',
            category: 'sulfate',
            clinker: '95-100%',
            description: 'Sulfate resisting Portland cement with C₃A ≤ 3% for high sulfate resistance',
            applications: ['Moderate sulfate environments', 'Underground structures', 'Marine foundations'],
            composition: { clinker: 100 },
            chemical_requirements: {
                c3a_limit: "C₃A ≤ 3%",
                sulfate_32_5: "≤ 3.0%",
                sulfate_42_5_52_5: "≤ 3.5%",
                chloride: "≤ 0.10%",
                loss_on_ignition: "≤ 5.0%",
                insoluble_residue: "≤ 5.0%"
            },
            available_strength_classes: ["32.5", "42.5", "52.5"]
        },
        {
            id: 'cem1-sr5',
            name: 'CEM I-SR 5',
            family: 'CEM I-SR',
            category: 'sulfate',
            clinker: '95-100%',
            description: 'Sulfate resisting Portland cement with C₃A ≤ 5% for moderate sulfate resistance',
            applications: ['Mild sulfate environments', 'General construction', 'Infrastructure projects'],
            composition: { clinker: 100 },
            chemical_requirements: {
                c3a_limit: "C₃A ≤ 5%",
                sulfate_32_5: "≤ 3.0%",
                sulfate_42_5_52_5: "≤ 3.5%",
                chloride: "≤ 0.10%",
                loss_on_ignition: "≤ 5.0%",
                insoluble_residue: "≤ 5.0%"
            },
            available_strength_classes: ["32.5", "42.5", "52.5"]
        },
        {
            id: 'cem4-a-sr',
            name: 'CEM IV/A-SR',
            family: 'CEM IV-SR',
            category: 'sulfate',
            clinker: '65-89%',
            additive: '11-35% Pozzolanic materials',
            description: 'Sulfate resisting pozzolanic cement A - enhanced chemical resistance',
            applications: ['Marine concrete', 'Sewage treatment plants', 'Chemical-resistant structures'],
            composition: { clinker: 75, pozzolan: 25 },
            chemical_requirements: {
                c3a_limit: "C₃A ≤ 9%",
                sulfate_32_5N_32_5R_42_5N: "≤ 3.5%",
                sulfate_42_5R_52_5N_52_5R: "≤ 4.0%",
                chloride: "≤ 0.10%",
                pozzolanicity_test: "Must satisfy test at 8 days"
            },
            available_strength_classes: ["32.5", "42.5", "52.5"]
        },
        {
            id: 'cem4-b-sr',
            name: 'CEM IV/B-SR',
            family: 'CEM IV-SR',
            category: 'sulfate',
            clinker: '45-64%',
            additive: '36-55% Pozzolanic materials',
            description: 'Sulfate resisting pozzolanic cement B - maximum chemical resistance with high pozzolan content',
            applications: ['Severe sulfate environments', 'Industrial structures', 'Long-term durability applications'],
            composition: { clinker: 55, pozzolan: 45 },
            chemical_requirements: {
                c3a_limit: "C₃A ≤ 9%",
                sulfate_32_5N_32_5R_42_5N: "≤ 3.5%",
                sulfate_42_5R_52_5N_52_5R: "≤ 4.0%",
                chloride: "≤ 0.10%",
                pozzolanicity_test: "Must satisfy test at 8 days"
            },
            available_strength_classes: ["32.5", "42.5", "52.5"]
        },
        {
            id: 'cem3-b-sr',
            name: 'CEM III/B-SR',
            family: 'CEM III-SR',
            category: 'sulfate',
            clinker: '20-34%',
            additive: '66-80% Slag',
            description: 'Sulfate resisting blast furnace cement B - natural sulfate resistance from high slag content',
            applications: ['Marine environments', 'Aggressive chemical conditions', 'Infrastructure'],
            composition: { clinker: 25, slag: 75 },
            chemical_requirements: {
                c3a_limit: "No C₃A requirement",
                sulfate_content: "≤ 4.5%",
                chloride: "≤ 0.10%",
                loss_on_ignition: "≤ 5.0%",
                insoluble_residue: "≤ 5.0%"
            },
            available_strength_classes: ["32.5", "42.5", "52.5"]
        },
        {
            id: 'cem3-c-sr',
            name: 'CEM III/C-SR',
            family: 'CEM III-SR',
            category: 'sulfate',
            clinker: '5-19%',
            additive: '81-95% Slag',
            description: 'Sulfate resisting blast furnace cement C - highest natural sulfate resistance',
            applications: ['Extreme sulfate environments', 'Seawater structures', 'Chemical containment'],
            composition: { clinker: 15, slag: 85 },
            chemical_requirements: {
                c3a_limit: "No C₃A requirement",
                sulfate_content: "≤ 4.5%",
                chloride: "≤ 0.10%",
                loss_on_ignition: "≤ 5.0%",
                insoluble_residue: "≤ 5.0%"
            },
            available_strength_classes: ["32.5", "42.5", "52.5"]
        }
    ],

    // Credits information
    credits: {
        prepared_by: "Mr. Fadi M. Darwesh",
        email: "asrar.cement@gmail.com",
        checked_by: "Mr.Emil E.Batarseh",
        title: "Director of Northern Cement Laboratories"
    },
    
    constituents: [
        {
            symbol: 'K',
            name: 'Portland Cement Clinker',
            category: 'Primary Hydraulic',
            description: 'The main hydraulic constituent produced by sintering limestone and clay',
            compounds: ['3CaO·SiO₂ (C₃S)', '2CaO·SiO₂ (C₂S)', '3CaO·Al₂O₃ (C₃A)', '4CaO·Al₂O₃·Fe₂O₃ (C₄AF)'],
            requirements: ['Calcium oxide (CaO) content typically 60-67%', 'Silicon dioxide (SiO₂) content typically 18-24%']
        },
        {
            symbol: 'S',
            name: 'Granulated Blast Furnace Slag',
            category: 'Hydraulic',
            description: 'Latent hydraulic material obtained by rapid cooling of molten slag',
            compounds: ['Calcium silicate hydrates', 'Aluminum-calcium silicate hydrates'],
            requirements: ['Glassy content ≥ 2/3 by mass', '(CaO + MgO)/SiO₂ > 1.0', 'CaO/SiO₂ > 1.0']
        },
        {
            symbol: 'P',
            name: 'Natural Pozzolan',
            category: 'Pozzolanic',
            description: 'Natural siliceous or aluminous material with pozzolanic properties',
            compounds: ['Reactive silica', 'Aluminum compounds', 'Iron compounds'],
            requirements: ['Reactive SiO₂ ≥ 25.0%', 'Total alkalis ≤ 5.0%', 'Volcanic origin preferred']
        },
        {
            symbol: 'D',
            name: 'Silica Fume',
            category: 'High Performance',
            description: 'Very fine pozzolanic material from silicon metal production',
            compounds: ['Amorphous SiO₂', 'Trace metallic elements'],
            requirements: ['SiO₂ ≥ 85%', 'Specific surface ≥ 15.0 m²/g', 'Maximum usage ≤ 10%']
        },
        {
            symbol: 'V',
            name: 'Fly Ash',
            category: 'Pozzolanic',
            description: 'Fine powder from combustion of pulverized coal',
            compounds: ['Siliceous glass', 'Crystalline phases', 'Carbon particles'],
            requirements: ['Reactive SiO₂ ≥ 25.0%', 'Loss on ignition ≤ 5.0%', 'Class F or C classification']
        },
        {
            symbol: 'W',
            name: 'Calcined Shale',
            category: 'Pozzolanic',
            description: 'Heat-treated clay-rich sedimentary rock',
            compounds: ['Activated alumina', 'Reactive silica', 'Iron compounds'],
            requirements: ['Calcination temperature 650-900°C', 'Reactive content ≥ 25%']
        },
        {
            symbol: 'Q',
            name: 'Calcined Pozzolan',
            category: 'Pozzolanic',
            description: 'Heat-treated natural pozzolanic material',
            compounds: ['Activated silica', 'Aluminum phases', 'Calcium compounds'],
            requirements: ['Reactive SiO₂ ≥ 25.0%', 'Proper calcination temperature']
        },
        {
            symbol: 'L',
            name: 'Limestone',
            category: 'Filler',
            description: 'Fine limestone powder acting as filler and nucleation sites',
            compounds: ['CaCO₃', 'Minor impurities'],
            requirements: ['CaCO₃ ≥ 75%', 'Clay content ≤ 1.20%', 'Total organic carbon ≤ 0.50%']
        },
        {
            symbol: 'LL',
            name: 'Low Grade Limestone',
            category: 'Filler',
            description: 'Lower purity limestone with higher clay content',
            compounds: ['CaCO₃', 'Clay minerals', 'Other impurities'],
            requirements: ['CaCO₃ ≥ 65%', 'Clay content ≤ 5.0%']
        },
        {
            symbol: 'M',
            name: 'Other Mineral Additions',
            category: 'Various',
            description: 'Approved inorganic materials meeting specific requirements',
            compounds: ['Variable composition'],
            requirements: ['Must meet specific performance criteria', 'Chemical and physical requirements']
        }
    ]
};

// Application State
let currentTheme = 'light';
let currentFilter = 'all';
let searchTerm = '';

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Hide loading screen
    setTimeout(() => {
        document.getElementById('loadingScreen').classList.add('hidden');
    }, 1500);
    
    // Set initial theme based on system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        currentTheme = 'dark';
    }
    setTheme(currentTheme);
    
    // Initialize components
    initializeNavigation();
    initializeSearch();
    initializeFilters();
    initializeModal();
    
    // Update filter counts and hero stats
    updateFilterCounts();
    updateHeroStats();
    updateCreditsInfo();
    
    // Render content
    renderCementTypes();
    renderConstituents();
    renderStrengthClasses();
    renderRequirements();
    renderCharts();
    
    // Initialize scroll progress
    updateScrollProgress();
    window.addEventListener('scroll', updateScrollProgress);
    
    // Add animations
    observeElements();
    
    // Initialize mobile menu
    initializeMobileMenu();
}

// Theme Management
function setTheme(theme) {
    currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
}

function toggleTheme() {
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
}

// Navigation
function initializeNavigation() {
    const themeToggle = document.getElementById('themeToggle');
    const navLinks = document.querySelectorAll('.nav-link');
    
    themeToggle.addEventListener('click', toggleTheme);
    
    // Smooth scrolling for navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                const headerHeight = 70;
                const targetPosition = targetElement.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // Update active link
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            }
        });
    });
    
    // Update active navigation based on scroll
    window.addEventListener('scroll', () => {
        const sections = ['overview', 'cement-types', 'constituents', 'strength-classes', 'requirements'];
        let current = '';
        
        sections.forEach(sectionId => {
            const section = document.getElementById(sectionId);
            if (section) {
                const rect = section.getBoundingClientRect();
                if (rect.top <= 100 && rect.bottom >= 100) {
                    current = sectionId;
                }
            }
        });
        
        if (current) {
            navLinks.forEach(link => {
                link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
            });
        }
    });
}

// Search Functionality
function initializeSearch() {
    const searchInput = document.getElementById('searchInput');
    
    searchInput.addEventListener('input', (e) => {
        searchTerm = e.target.value;
        renderCementTypes();
        renderConstituents();
    });
}

// Filter Management
function initializeFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            currentFilter = button.dataset.filter;
            
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            renderCementTypes();
        });
    });
}

// Modal Management
function initializeModal() {
    const modal = document.getElementById('detailModal');
    const closeModal = document.getElementById('modalClose');
    
    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
}

function openModal(content) {
    const modal = document.getElementById('detailModal');
    const modalContent = document.getElementById('modalContent');
    
    modalContent.innerHTML = content;
    modal.style.display = 'block';
}

// Content Rendering
function renderCementTypes() {
    const grid = document.getElementById('cementTypesGrid');
    let filteredTypes = cementData.types;
    
    // Apply filters
    if (currentFilter !== 'all') {
        filteredTypes = cementData.types.filter(type => type.category === currentFilter);
    }
    
    // Apply search
    if (searchTerm) {
        const searchLower = searchTerm.trim().toLowerCase();
        if (searchLower.length > 0) {
            filteredTypes = filteredTypes.filter(type => {
                const searchableText = [
                    type.name,
                    type.family,
                    type.description,
                    ...type.applications
                ].join(' ').toLowerCase();
                
                return searchableText.includes(searchLower);
            });
        }
    }
    
    grid.innerHTML = filteredTypes.map(type => `
        <div class="card" onclick="showCementTypeDetails('${type.id}')">
            <div class="card-header">
                <div>
                    <div class="card-title">${type.name}</div>
                    <div class="card-subtitle">${type.family} Family</div>
                </div>
                <div class="card-icon">
                    <i class="fas fa-cube"></i>
                </div>
            </div>
            <div class="card-content">
                <p><strong>Clinker Content:</strong> ${type.clinker}</p>
                ${type.additive ? `<p><strong>Additive:</strong> ${type.additive}</p>` : ''}
                <p>${type.description}</p>
                <div class="composition-bar">
                    ${renderCompositionBar(type.composition)}
                </div>
                <p style="color: var(--primary-blue); font-weight: 500; margin-top: 15px;">
                    <i class="fas fa-mouse-pointer"></i> Click to see available strength classes & variants
                </p>
            </div>
            <div class="card-tags">
                ${type.applications.slice(0, 2).map(app => `<span class="tag">${app}</span>`).join('')}
                ${type.applications.length > 2 ? '<span class="tag">+' + (type.applications.length - 2) + ' more</span>' : ''}
            </div>
        </div>
    `).join('');
}

function renderCompositionBar(composition) {
    const colors = {
        clinker: '#1e40af',
        slag: '#64748b',
        pozzolan: '#f97316',
        silicaFume: '#10b981',
        limestone: '#94a3b8',
        flyAsh: '#8b5cf6',
        burntShale: '#ef4444',
        mixed: '#6366f1'
    };
    
    return Object.entries(composition).map(([component, percentage]) => {
        const color = colors[component] || '#6b7280';
        const displayName = component.replace(/([A-Z])/g, ' $1').toLowerCase();
        return `
            <div class="composition-segment" 
                 style="width: ${percentage}%; background-color: ${color};" 
                 title="${displayName}: ${percentage}%">
                ${percentage > 15 ? percentage + '%' : ''}
            </div>
        `;
    }).join('');
}

function renderConstituents() {
    const grid = document.getElementById('constituentsGrid');
    let filteredConstituents = cementData.constituents;
    
    if (searchTerm) {
        const searchLower = searchTerm.trim().toLowerCase();
        if (searchLower.length > 0) {
            filteredConstituents = cementData.constituents.filter(constituent => 
                constituent.name.toLowerCase().includes(searchLower) ||
                constituent.category.toLowerCase().includes(searchLower) ||
                constituent.description.toLowerCase().includes(searchLower)
            );
        }
    }
    
    grid.innerHTML = filteredConstituents.map(constituent => `
        <div class="card" onclick="showConstituentDetails('${constituent.symbol}')">
            <div class="card-header">
                <div>
                    <div class="card-title">${constituent.name}</div>
                    <div class="card-subtitle">Symbol: ${constituent.symbol} | ${constituent.category}</div>
                </div>
                <div class="card-icon">
                    <i class="fas fa-atom"></i>
                </div>
            </div>
            <div class="card-content">
                <p>${constituent.description}</p>
                <p><strong>Main Compounds:</strong></p>
                <ul style="margin-left: 20px; color: var(--text-secondary);">
                    ${constituent.compounds.map(compound => `<li>${compound}</li>`).join('')}
                </ul>
            </div>
            <div class="card-tags">
                <span class="tag">${constituent.category}</span>
            </div>
        </div>
    `).join('');
}

function renderStrengthClasses() {
    const grid = document.getElementById('strengthClassesGrid');
    
    grid.innerHTML = Object.entries(cementData.strengthClasses).map(([className, classData]) => `
        <div class="card" onclick="showStrengthClassDetails('${className}')">
            <div class="card-header">
                <div>
                    <div class="card-title">Class ${className}</div>
                    <div class="card-subtitle">${classData.variants.N.standard_min}${classData.variants.N.standard_max ? '-' + classData.variants.N.standard_max : '+'} MPa Standard Strength</div>
                </div>
                <div class="card-icon">
                    <i class="fas fa-weight-hanging"></i>
                </div>
            </div>
            <div class="card-content">
                <p><strong>Available Variants:</strong></p>
                <div class="variant-pills" style="display: flex; gap: 8px; margin: 10px 0; flex-wrap: wrap;">
                    ${Object.entries(classData.variants).map(([variant, data]) => 
                        `<span class="tag" style="background: var(--primary-blue); color: white;">
                            ${variant} - ${data.name}
                        </span>`
                    ).join('')}
                </div>
                <p><strong>Early Strength Range:</strong> ${Math.min(...Object.values(classData.variants).map(v => v.early_min))} - ${Math.max(...Object.values(classData.variants).map(v => v.early_min))} MPa</p>
                <p style="color: var(--primary-blue); font-weight: 500;">
                    <i class="fas fa-mouse-pointer"></i> Click to see detailed requirements for each variant
                </p>
            </div>
        </div>
    `).join('');
}

// MODIFIED FUNCTION TO CLARIFY REQUIREMENTS
function renderRequirements() {
    const grid = document.getElementById('requirementsGrid');
    
    const requirements = [
        {
            title: 'Chemical Requirements',
            icon: 'fas fa-flask',
            items: [
                '<strong>Loss on ignition ≤ 5.0%</strong> (Applicable to CEM I & CEM III)',
                '<strong>Insoluble residue ≤ 5.0%</strong> (Applicable to CEM I & CEM III)',
                'Sulfate content (as SO₃) ≤ 4.0% (Varies by type and strength class)',
                'Chloride content ≤ 0.10% (General for all types)',
                'Pozzolanicity test: Positive (Required for pozzolanic cements)'
            ]
        },
        {
            title: 'Physical Requirements',
            icon: 'fas fa-ruler',
            items: [
                'Fineness (specific surface)',
                'Standard consistency',
                'Setting time (Initial & Final)',
                'Soundness (Expansion)',
                'Compressive strength (Early & Standard)'
            ]
        }
    ];
    
    grid.innerHTML = requirements.map(req => `
        <div class="card">
            <div class="card-header">
                <div>
                    <div class="card-title">${req.title}</div>
                    <div class="card-subtitle">BS EN 197-1:2011 General Standards</div>
                </div>
                <div class="card-icon">
                    <i class="${req.icon}"></i>
                </div>
            </div>
            <div class="card-content">
                <ul style="margin: 0; padding-left: 20px; color: var(--text-secondary); line-height: 1.8;">
                    ${req.items.map(item => `<li>${item}</li>`).join('')}
                </ul>
                 <p style="margin-top: 15px; font-size: 0.9rem; color: var(--primary-blue);">
                    <i>Note: Specific limits for each requirement are detailed within each cement type's modal view.</i>
                </p>
            </div>
        </div>
    `).join('');
}

// Chart Rendering
function renderCharts() {
    renderStrengthChart();
    renderCompositionChart();
}

function renderStrengthChart() {
    const canvas = document.getElementById('strengthChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    const chartData = {
        labels: [],
        datasets: [
            {
                label: 'Early Strength Minimum (MPa)',
                data: [],
                backgroundColor: 'rgba(31, 184, 205, 0.7)',
                borderColor: '#1FB8CD',
                borderWidth: 2
            },
            {
                label: '28-day Minimum (MPa)',
                data: [],
                backgroundColor: 'rgba(255, 193, 133, 0.7)',
                borderColor: '#FFC185',
                borderWidth: 2
            },
            {
                label: '28-day Maximum (MPa)',
                data: [],
                backgroundColor: 'rgba(180, 65, 60, 0.7)',
                borderColor: '#B4413C',
                borderWidth: 2
            }
        ]
    };
    
    Object.entries(cementData.strengthClasses).forEach(([className, classData]) => {
        Object.entries(classData.variants).forEach(([variant, data]) => {
            chartData.labels.push(`${className} ${variant}`);
            chartData.datasets[0].data.push(data.early_min);
            chartData.datasets[1].data.push(data.standard_min);
            chartData.datasets[2].data.push(data.standard_max || data.standard_min + 20);
        });
    });
    
    new Chart(ctx, {
        type: 'bar',
        data: chartData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'All Strength Class Variants (N, R, L) - Requirements',
                    font: { size: 16 }
                },
                legend: {
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Compressive Strength (MPa)'
                    }
                },
                x: {
                    ticks: {
                        maxRotation: 45
                    }
                }
            }
        }
    });
}

function renderCompositionChart() {
    const canvas = document.getElementById('compositionChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    const familyCounts = {
        'CEM I': 0, 'CEM II': 0, 'CEM III': 0, 'CEM IV': 0, 'CEM V': 0, 'Sulfate Resistant': 0
    };
    
    cementData.types.forEach(type => {
        if (type.category === 'sulfate') {
            familyCounts['Sulfate Resistant']++;
        } else {
            const family = type.family.split('/')[0];
            if (familyCounts[family] !== undefined) {
                familyCounts[family]++;
            }
        }
    });
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(familyCounts),
            datasets: [{
                label: 'Cement Types Distribution',
                data: Object.values(familyCounts),
                backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F', '#DB4545'],
                borderWidth: 3,
                borderColor: getComputedStyle(document.documentElement).getPropertyValue('--color-bg-1') || '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Distribution of Cement Family Types',
                    font: { size: 16 }
                },
                legend: {
                    position: 'bottom'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                            const count = context.parsed;
                            const percentage = ((count / total) * 100).toFixed(1);
                            return `${context.label}: ${count} types (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}


// Detail Modal Functions
function showCementTypeDetails(typeId) {
    const type = cementData.types.find(t => t.id === typeId);
    if (!type) return;
    
    const content = `
        <h2 style="color: var(--primary-blue); margin-bottom: 20px;">${type.name}</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 30px;">
            <div>
                <h4>Basic Information</h4>
                <p><strong>Family:</strong> ${type.family}</p>
                <p><strong>Clinker Content:</strong> ${type.clinker}</p>
                ${type.additive ? `<p><strong>Additive:</strong> ${type.additive}</p>` : ''}
                <p><strong>Category:</strong> ${type.category}</p>
            </div>
            <div>
                <h4>Composition</h4>
                <div class="composition-bar" style="margin: 10px 0;">
                    ${renderCompositionBar(type.composition)}
                </div>
                ${Object.entries(type.composition).map(([component, percentage]) => 
                    `<p><strong>${component.charAt(0).toUpperCase() + component.slice(1)}:</strong> ${percentage}%</p>`
                ).join('')}
            </div>
        </div>
        
        <div style="margin-bottom: 30px;">
            <h4>Chemical Requirements for ${type.name}</h4>
            <div style="background: var(--surface); padding: 15px; border-radius: 10px; border: 1px solid var(--border);">
                ${Object.entries(type.chemical_requirements || {}).map(([req, value]) => 
                    `<p><strong>${req.replace(/_/g, ' ').toUpperCase()}:</strong> ${value}</p>`
                ).join('')}
            </div>
        </div>
        
        <div style="margin-bottom: 30px;">
            
            <h4>Available Strength Classes & Variants</h4>

            <div style="font-size: 0.9rem; padding: 10px; background: var(--surface); border-radius: 8px; margin-bottom: 15px; text-align: center; border: 1px solid var(--border);">
                <strong>Key:</strong> 
                <span style="color: var(--primary-blue); font-weight: bold;">✓</span> = Available Variant&nbsp;&nbsp;|&nbsp;&nbsp;
                <span style="color: var(--text-secondary); font-weight: bold;">✗</span> = Not Available Variant
            </div>
            
            ${type.available_strength_classes.map(strengthClass => {
                const classData = cementData.strengthClasses[strengthClass];
                return `
                    <div style="background: var(--surface); margin: 15px 0; padding: 20px; border-radius: 10px; border: 1px solid var(--border);">
                        <h5 style="color: var(--primary-blue); margin-bottom: 15px;">Class ${strengthClass} MPa</h5>
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                            ${Object.entries(classData.variants).map(([variant, data]) => {
                                let isAvailable = false;
                                const isCemThree = type.family === 'CEM III';

                                if (variant === 'L') {
                                    isAvailable = isCemThree;
                                } else if (variant === 'R') {
                                    isAvailable = !isCemThree;
                                } else if (variant === 'N') {
                                    isAvailable = true;
                                }
                                
                                return `
                                    <div style="padding: 15px; border-radius: 8px; border: 2px solid ${
                                        isAvailable ? 'var(--primary-blue)' : 'var(--border)'
                                    }; ${isAvailable ? '' : 'opacity: 0.5;'}">
                                        <h6 style="color: ${isAvailable ? 'var(--primary-blue)' : 'var(--text-secondary)'}; margin-bottom: 10px;">
                                            ${strengthClass} ${variant} ${isAvailable ? '✓' : '✗'}
                                        </h6>
                                        <p style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 8px;">
                                            ${data.name}
                                        </p>
                                        <p style="font-size: 0.85rem;">
                                            <strong>${data.early_days}-day:</strong> ≥${data.early_min} MPa<br>
                                            <strong>28-day:</strong> ${data.standard_min}${data.standard_max ? '-' + data.standard_max : '+'} MPa<br>
                                            <strong>Setting:</strong> ≥${data.setting_time} min
                                        </p>
                                        ${isAvailable ? `
                                            <div style="margin-top: 10px;">
                                                <p style="font-size: 0.8rem; font-weight: 500; color: var(--primary-blue);">Applications:</p>
                                                <ul style="font-size: 0.8rem; color: var(--text-secondary); margin: 5px 0 0 15px;">
                                                    ${data.applications.slice(0, 2).map(app => `<li>${app}</li>`).join('')}
                                                </ul>
                                            </div>
                                        ` : ''}
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
        
        <div>
            <h4>Description</h4>
            <p style="margin-bottom: 20px;">${type.description}</p>
            
            <h4>Typical Applications</h4>
            <ul style="margin-left: 20px; color: var(--text-secondary);">
                ${type.applications.map(app => `<li>${app}</li>`).join('')}
            </ul>
        </div>
    `;
    
    openModal(content);
}

function showConstituentDetails(symbol) {
    const constituent = cementData.constituents.find(c => c.symbol === symbol);
    if (!constituent) return;
    
    const content = `
        <h2 style="color: var(--primary-blue); margin-bottom: 20px;">${constituent.name}</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 30px;">
            <div>
                <h4>Basic Information</h4>
                <p><strong>Symbol:</strong> ${constituent.symbol}</p>
                <p><strong>Category:</strong> ${constituent.category}</p>
            </div>
        </div>
        <div style="margin-bottom: 20px;">
            <h4>Description</h4>
            <p>${constituent.description}</p>
        </div>
        <div style="margin-bottom: 20px;">
            <h4>Main Compounds</h4>
            <ul style="margin-left: 20px; color: var(--text-secondary);">
                ${constituent.compounds.map(compound => `<li>${compound}</li>`).join('')}
            </ul>
        </div>
        <div>
            <h4>Requirements</h4>
            <ul style="margin-left: 20px; color: var(--text-secondary);">
                ${constituent.requirements.map(req => `<li>${req}</li>`).join('')}
            </ul>
        </div>
    `;
    
    openModal(content);
}

function showStrengthClassDetails(className) {
    const classData = cementData.strengthClasses[className];
    if (!classData) return;
    
    const content = `
        <h2 style="color: var(--primary-blue); margin-bottom: 20px;">Strength Class ${className} MPa</h2>
        
        <div style="margin-bottom: 30px;">
            <h4>All Variants for Class ${className}</h4>
            ${Object.entries(classData.variants).map(([variant, data]) => `
                <div style="background: var(--surface); margin: 15px 0; padding: 20px; border-radius: 10px; border: 1px solid var(--border);">
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px;">
                        <div>
                            <h5 style="color: var(--primary-blue); margin-bottom: 10px;">
                                ${className} ${variant} - ${data.name}
                            </h5>
                            <p><strong>Early Strength (${data.early_days} days):</strong> ≥${data.early_min} MPa</p>
                            <p><strong>Standard Strength (28 days):</strong> ${data.standard_min}${data.standard_max ? '-' + data.standard_max : '+'} MPa</p>
                            <p><strong>Initial Setting Time:</strong> ≥${data.setting_time} minutes</p>
                        </div>
                    </div>
                    <div style="margin-top: 15px;">
                        <h6 style="color: var(--text-secondary); margin-bottom: 8px;">Typical Applications:</h6>
                        <ul style="margin-left: 15px; color: var(--text-secondary); font-size: 0.9rem;">
                            ${data.applications.map(app => `<li>${app}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            `).join('')}
        </div>
        
        <div style="background: var(--light-orange); padding: 20px; border-radius: 10px; margin-top: 30px;">
            <h4 style="color: var(--accent-orange); margin-bottom: 15px;">Understanding Strength Variants</h4>
            <ul style="color: var(--text-primary); margin-left: 20px;">
                <li><strong>N (Normal):</strong> Standard early strength development - most common variant</li>
                <li><strong>R (Rapid):</strong> Higher early strength for fast construction and early demolding</li>
                <li><strong>L (Low):</strong> Lower early strength for mass concrete to reduce heat of hydration - CEM III only</li>
            </ul>
        </div>
    `;
    
    openModal(content);
}

// Update UI counts based on actual data
function updateFilterCounts() {
    const counts = {
        all: cementData.types.length,
        common: cementData.types.filter(t => t.category === 'common').length,
        sulfate: cementData.types.filter(t => t.category === 'sulfate').length,
        lowEarly: cementData.types.filter(t => t.family === 'CEM III').length
    };
    
    document.getElementById('filterAll').textContent = `All Types (${counts.all})`;
    document.getElementById('filterCommon').textContent = `Common (${counts.common})`;
    document.getElementById('filterSulfate').textContent = `Sulfate Resistant (${counts.sulfate})`;
    document.getElementById('filterLowEarly').textContent = `Low Early Strength (${counts.lowEarly})`;
}

function updateHeroStats() {
    document.getElementById('totalTypesCount').textContent = cementData.types.length;
}

// Populate credits information from data
function updateCreditsInfo() {
    if (cementData.credits) {
        document.getElementById('preparedBy').textContent = cementData.credits.prepared_by;
        const emailEl = document.getElementById('preparedEmail');
        emailEl.textContent = cementData.credits.email;
        emailEl.href = `mailto:${cementData.credits.email}`;
        document.getElementById('checkedBy').textContent = cementData.credits.checked_by;
        document.getElementById('checkedTitle').textContent = cementData.credits.title;
    }
}

// Utility Functions
function updateScrollProgress() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrollPercent = (scrollTop / docHeight) * 100;
    
    document.getElementById('progressBar').style.width = scrollPercent + '%';
}

function observeElements() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.card, .section, .hero-stats .stat').forEach(el => {
        observer.observe(el);
    });
}

function initializeMobileMenu() {
    const mobileMenu = document.getElementById('mobileMenu');
    const navLinks = document.querySelector('.nav-links');
    
    mobileMenu.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        mobileMenu.classList.toggle('active');
    });
}