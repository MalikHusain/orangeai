import { motion } from 'framer-motion'
import styles from './About.module.css'

const MODEL_METRICS = [
  { label:'Architecture',        value:'ResNet-50 (Transfer Learning from ImageNet)' },
  { label:'Training Images',     value:'50,000+ augmented samples' },
  { label:'Validation Accuracy', value:'94.7%' },
  { label:'Validation Loss',     value:'0.187' },
  { label:'Dataset',             value:'PlantVillage + Custom Orange Dataset' },
  { label:'Disease Classes',     value:'9 (8 diseases + healthy)' },
  { label:'Input Size',          value:'224 × 224 × 3 (RGB)' },
  { label:'Output',              value:'9-class Softmax probability vector' },
  { label:'Avg. Inference',      value:'~800ms (CPU) · ~120ms (GPU)' },
  { label:'Framework',           value:'TensorFlow 2.x / Keras' },
  { label:'Optimizer',           value:'Adam — Phase 1: LR=1e-3, Phase 2: LR=1e-5' },
  { label:'Augmentation',        value:'Rotation, flip, zoom, brightness, shear' },
  { label:'Training Strategy',   value:'2-Phase: frozen base → full fine-tune' },
  { label:'Regularization',      value:'L2 weight decay + Dropout (0.5 / 0.3)' },
]

const DISEASE_SPECIES = [
  {
    id: 'citrus_canker',
    name: 'Citrus Canker',
    icon: '🍂',
    pathogen: 'Xanthomonas axonopodis pv. citri',
    kingdom: 'Bacteria',
    family: 'Xanthomonadaceae',
    hosts: 'All Citrus species — especially oranges, lemons, limes',
    spread: 'Wind-driven rain, contaminated tools, infected nursery stock',
    conditions: 'Warm (25–30°C), humid, windy weather accelerates spread',
    economic: 'Reduces fruit quality and market value; causes premature drop',
    color: '#DC2626', bg: '#FEE2E2',
  },
  {
    id: 'hlb',
    name: 'Huanglongbing (HLB)',
    icon: '🌿',
    pathogen: 'Candidatus Liberibacter asiaticus',
    kingdom: 'Bacteria (phloem-limited)',
    family: 'Rhizobiaceae',
    hosts: 'All commercial Citrus species; also Murraya paniculata',
    spread: 'Asian Citrus Psyllid (Diaphorina citri) — vector insect',
    conditions: 'No temperature limitation; spread depends on psyllid population',
    economic: 'No cure — most destructive citrus disease globally; kills trees in 5–8 years',
    color: '#D97706', bg: '#FEF3C7',
  },
  {
    id: 'black_spot',
    name: 'Citrus Black Spot',
    icon: '⚫',
    pathogen: 'Phyllosticta citricarpa (teleomorph: Guignardia citricarpa)',
    kingdom: 'Fungi',
    family: 'Phyllostictaceae',
    hosts: 'Sweet orange, mandarin, grapefruit, lemon',
    spread: 'Ascospores dispersed by rain splash during wet season',
    conditions: 'Warm, humid climate with rainfall during fruit development',
    economic: 'Makes fruit unmarketable; quarantine pest in EU & USA',
    color: '#1F2937', bg: '#F3F4F6',
  },
  {
    id: 'root_rot',
    name: 'Phytophthora Root Rot',
    icon: '🌱',
    pathogen: 'Phytophthora parasitica / P. citrophthora',
    kingdom: 'Oomycota (water moulds — not true fungi)',
    family: 'Pythiaceae',
    hosts: 'All Citrus rootstocks; worst on sour orange, sweet orange',
    spread: 'Waterlogged soils, contaminated irrigation water, soil movement',
    conditions: 'Waterlogging + warm soil (25–30°C) triggers infection',
    economic: 'Progressive tree decline; major cause of citrus replant failure',
    color: '#7C3AED', bg: '#EDE9FE',
  },
  {
    id: 'melanose',
    name: 'Melanose',
    icon: '🟤',
    pathogen: 'Diaporthe citri (anamorph: Phomopsis citri)',
    kingdom: 'Fungi',
    family: 'Diaporthaceae',
    hosts: 'All Citrus species; grapefruit most susceptible',
    spread: 'Conidia and ascospores released from dead wood during wet weather',
    conditions: 'Wet weather during flush growth and young fruit development',
    economic: 'Cosmetic damage to fruit; reduces export grade quality',
    color: '#92400E', bg: '#FEF3C7',
  },
  {
    id: 'sooty_mould',
    name: 'Sooty Mould',
    icon: '🌫️',
    pathogen: 'Capnodium citri + multiple species (Meliola, Fumago)',
    kingdom: 'Fungi (secondary — grows on insect honeydew)',
    family: 'Capnodiaceae',
    hosts: 'All Citrus; any plant infested with honeydew-producing insects',
    spread: 'Not infectious — grows wherever honeydew accumulates from aphids, scale, mealybugs',
    conditions: 'High insect pressure + humid conditions',
    economic: 'Reduces photosynthesis; signals underlying pest infestation',
    color: '#4B5563', bg: '#F3F4F6',
  },
  {
    id: 'tristeza',
    name: 'Citrus Tristeza Virus',
    icon: '🍃',
    pathogen: 'Citrus tristeza closterovirus (CTV)',
    kingdom: 'Virus — Closteroviridae family',
    family: 'Closteroviridae',
    hosts: 'All Citrus; most lethal on sweet orange / sour orange rootstock combination',
    spread: 'Brown citrus aphid (Toxoptera citricida) — highly efficient vector',
    conditions: 'Spread is fastest during aphid migration seasons (spring/autumn)',
    economic: 'Killed 100 million trees globally in 20th century; still a major threat',
    color: '#15803D', bg: '#DCFCE7',
  },
  {
    id: 'scab',
    name: 'Citrus Scab',
    icon: '🔴',
    pathogen: 'Elsinoe fawcettii / Elsinoe australis',
    kingdom: 'Fungi',
    family: 'Elsinoaceae',
    hosts: 'Sour orange, mandarin, lemon; less on sweet orange',
    spread: 'Conidia dispersed by rain splash during wet, cool conditions',
    conditions: 'Cool (20–22°C), wet weather; worst during young flush growth',
    economic: 'Deforms young leaves and fruit; reduces fresh market value',
    color: '#B45309', bg: '#FEF3C7',
  },
]

const TECH_STACK = [
  { layer:'Frontend',  items:['React 18 + Vite','Framer Motion (animations)','Recharts (charts)','React Router v6','CSS Modules'] },
  { layer:'Backend',   items:['FastAPI (Python)','Uvicorn ASGI server','Pydantic v2 validation','SQLAlchemy ORM','Alembic migrations'] },
  { layer:'AI / ML',   items:['TensorFlow 2.x / Keras','ResNet-50 base model','Transfer learning (ImageNet)','NumPy + Pillow preprocessing','Scikit-learn (evaluation)'] },
  { layer:'Database',  items:['SQLite (development)','PostgreSQL (production)','Async SQLAlchemy sessions','Disease detection history','Geo-tagged report storage'] },
  { layer:'Features',  items:['Web Speech API (TTS)','Geolocation API','HTML5 Canvas heatmap','LocalStorage history','Drag & drop upload','Live camera capture'] },
]

const TEAM = [
  { role:'Team Lead / AI',      icon:'🧠', desc:'Model architecture, ResNet-50 training, inference pipeline, accuracy evaluation' },
  { role:'Frontend Developer',  icon:'💻', desc:'React UI, page routing, animations, responsive design, chart integration' },
  { role:'Backend Developer',   icon:'⚙️', desc:'FastAPI routes, database schema, REST API design, async DB sessions' },
  { role:'Data & Research',     icon:'🔬', desc:'Dataset collection, image augmentation, disease research, multilingual content' },
]

export default function About() {
  return (
    <div className={styles.page}>
      <div className={styles.inner}>

        {/* Header */}
        <motion.div className={styles.header} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}>
          <span className={styles.badge}><span className={styles.dot}/>AI-Powered Plant Pathology</span>
          <h1 className={styles.title}>About OrangeAI</h1>
          <p className={styles.sub}>
            A deep learning system for real-time orange disease detection — helping farmers
            identify crop diseases instantly and receive treatment guidance in their own language.
          </p>
        </motion.div>

        {/* Mission */}
        <motion.div
          className={styles.missionCard}
          initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:.1}}
        >
          <div className={styles.missionIcon}>🍊</div>
          <div>
            <h2 className={styles.missionTitle}>Our Mission</h2>
            <p className={styles.missionText}>
              Vidarbha is one of India's largest orange-growing regions, home to millions of farmers
              who depend on orange crops for their livelihood. Disease outbreaks cause massive crop losses
              every year — often because farmers cannot identify the disease early or accurately enough
              to take the right action in time.
            </p>
            <p className={styles.missionText} style={{marginTop:12}}>
              OrangeAI puts a 94.7% accurate AI model in every farmer's pocket — completely free.
              Upload a photo of any affected leaf, fruit, or bark — and get an instant diagnosis,
              severity rating, and a complete treatment plan in Marathi, Hindi, or English within seconds.
            </p>
          </div>
        </motion.div>

        {/* System Flow */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>⚙️ System Architecture & Flow</h2>
          <div className={styles.flowGrid}>
            {[
              { step:'01', icon:'📸', title:'Upload',      desc:'User uploads a leaf, fruit, or bark photo via the React frontend. Camera capture and drag-and-drop are both supported.' },
              { step:'02', icon:'🔄', title:'Preprocess',  desc:'FastAPI receives the image → Pillow resizes it to 224×224 pixels → Pixel values normalised to [0,1] float tensor.' },
              { step:'03', icon:'🧠', title:'Inference',   desc:'ResNet-50 CNN runs a forward pass → Softmax activation over 9 disease classes → Top-3 probability predictions returned.' },
              { step:'04', icon:'📊', title:'Enrich',      desc:'Backend attaches full disease data: treatment plans, scientific info, Marathi/Hindi translations, and severity rating.' },
              { step:'05', icon:'🗺️', title:'Geo Log',    desc:'If location is shared, the geo-tagged detection is saved to PostgreSQL and contributes to the regional disease heatmap.' },
              { step:'06', icon:'📱', title:'Display',     desc:'React renders the 5-tab results: diagnosis, treatment, multilingual TTS output, interactive heatmap, and downloadable report.' },
            ].map((s, i) => (
              <motion.div
                key={s.step}
                className={styles.flowCard}
                initial={{opacity:0,y:16}} whileInView={{opacity:1,y:0}}
                viewport={{once:true}} transition={{delay:i*.06}}
              >
                <div className={styles.flowStep}>{s.step}</div>
                <div className={styles.flowIcon}>{s.icon}</div>
                <div className={styles.flowTitle}>{s.title}</div>
                <div className={styles.flowDesc}>{s.desc}</div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* AI Model Details */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>🧪 AI Model Details</h2>
          <div className={styles.metricsGrid}>
            {MODEL_METRICS.map(m => (
              <div key={m.label} className={styles.metricRow}>
                <span className={styles.metricLabel}>{m.label}</span>
                <span className={styles.metricValue}>{m.value}</span>
              </div>
            ))}
          </div>
          <div className={styles.accCard}>
            <div className={styles.accTitle}>Validation Accuracy — 94.7%</div>
            <div className={styles.accBar}>
              <motion.div
                className={styles.accFill}
                initial={{width:0}} whileInView={{width:'94.7%'}}
                viewport={{once:true}} transition={{duration:1.2, ease:'easeOut'}}
              />
            </div>
            <div className={styles.accNote}>
              Tested on 10,000 held-out images. ResNet-50 pretrained on ImageNet,
              fine-tuned in 2 phases on orange disease dataset with aggressive augmentation.
            </div>
          </div>

          {/* How ResNet-50 works */}
          <div className={styles.modelExplain}>
            <h3 className={styles.modelExplainTitle}>How ResNet-50 Works for Disease Detection</h3>
            <div className={styles.modelExplainGrid}>
              <div className={styles.modelExplainCard}>
                <div className={styles.modelExplainNum}>1</div>
                <div className={styles.modelExplainHead}>Feature Extraction</div>
                <div className={styles.modelExplainText}>
                  The 50-layer residual network extracts hierarchical visual features — edges and textures in early layers,
                  complex patterns like lesion shapes and colour abnormalities in deeper layers.
                </div>
              </div>
              <div className={styles.modelExplainCard}>
                <div className={styles.modelExplainNum}>2</div>
                <div className={styles.modelExplainHead}>Skip Connections</div>
                <div className={styles.modelExplainText}>
                  ResNet's signature residual connections allow gradients to flow directly through the network,
                  solving the vanishing gradient problem and enabling stable training at 50 layers.
                </div>
              </div>
              <div className={styles.modelExplainCard}>
                <div className={styles.modelExplainNum}>3</div>
                <div className={styles.modelExplainHead}>Transfer Learning</div>
                <div className={styles.modelExplainText}>
                  Pre-trained on 1.2M ImageNet images. The base weights already understand shapes,
                  textures, and patterns — we fine-tune the top layers specifically for orange disease patterns.
                </div>
              </div>
              <div className={styles.modelExplainCard}>
                <div className={styles.modelExplainNum}>4</div>
                <div className={styles.modelExplainHead}>Classification Head</div>
                <div className={styles.modelExplainText}>
                  Global Average Pooling → Dense(512) → Dropout(0.5) → Dense(256) → Dropout(0.3) → Softmax(9).
                  Outputs a probability for each of the 9 disease classes.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Disease & Pathogen Info */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>🦠 Disease Species & Pathogens</h2>
          <p className={styles.sectionSub}>
            Scientific information about each pathogen the model is trained to detect.
          </p>
          <div className={styles.diseaseSpeciesGrid}>
            {DISEASE_SPECIES.map((d, i) => (
              <motion.div
                key={d.id}
                className={styles.speciesCard}
                style={{ borderTopColor: d.color }}
                initial={{opacity:0,y:16}} whileInView={{opacity:1,y:0}}
                viewport={{once:true}} transition={{delay:i*.04}}
              >
                <div className={styles.speciesHeader}>
                  <div className={styles.speciesIconWrap} style={{background:d.bg}}>
                    {d.icon}
                  </div>
                  <div>
                    <div className={styles.speciesName}>{d.name}</div>
                    <div className={styles.speciesKingdom} style={{color:d.color}}>{d.kingdom}</div>
                  </div>
                </div>
                <div className={styles.speciesRows}>
                  <div className={styles.speciesRow}><span>Pathogen</span><em>{d.pathogen}</em></div>
                  <div className={styles.speciesRow}><span>Family</span><span>{d.family}</span></div>
                  <div className={styles.speciesRow}><span>Host Plants</span><span>{d.hosts}</span></div>
                  <div className={styles.speciesRow}><span>Spread</span><span>{d.spread}</span></div>
                  <div className={styles.speciesRow}><span>Favourable Conditions</span><span>{d.conditions}</span></div>
                  <div className={styles.speciesRow} style={{borderBottom:'none'}}><span>Economic Impact</span><span>{d.economic}</span></div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Tech Stack */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>🛠️ Technology Stack</h2>
          <div className={styles.techGrid}>
            {TECH_STACK.map((t, i) => (
              <motion.div
                key={t.layer}
                className={styles.techCard}
                initial={{opacity:0,y:16}} whileInView={{opacity:1,y:0}}
                viewport={{once:true}} transition={{delay:i*.07}}
              >
                <div className={styles.techLayer}>{t.layer}</div>
                <ul className={styles.techList}>
                  {t.items.map(item => <li key={item}>{item}</li>)}
                </ul>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Team */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>👥 Team Roles</h2>
          <div className={styles.teamGrid}>
            {TEAM.map(m => (
              <div key={m.role} className={styles.teamCard}>
                <div className={styles.teamIcon}>{m.icon}</div>
                <div className={styles.teamRole}>{m.role}</div>
                <div className={styles.teamDesc}>{m.desc}</div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  )
}