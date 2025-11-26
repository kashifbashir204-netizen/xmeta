import React, { useState, useEffect, useRef } from 'react';
import {
    Rocket,
    Wallet,
    Globe,
    Zap,
    Users,
    Cpu,
    Menu,
    X,
    ChevronRight,
    Gamepad2,
    Box,
    Music,
    ShieldCheck,
    Terminal,
    Sparkles,
    ArrowRight,
    MessageSquare,
    Play,
    Volume2,
    Loader,
    FileText,
    Send,
    MessageCircle,
    Vote,
    Radio,
    Fingerprint,
    Crosshair,
    Trophy,
    Target,
    Coins,
    AlertTriangle,
    Code,
    Handshake,
    Newspaper,
    Dna,
    Pause
} from 'lucide-react';
import { Client } from 'xrpl';
import { connectWallet, logoutWallet, getXummInstance } from './utils/xaman';
import { TOKEN_HEX, ISSUER_ADDRESS, TOKEN_NAME, CLAIM_WALLET } from './config';

/**
 * XMeta XGalaxies - Community Resurrection Portal
 * 2025 Relaunch Edition
 * Mobile-First, XRPL-Native, Future-Proof
 */

// --- Constants & Data ---

const XRPL_ISSUER = "r3XwJ1hr1PtbRvbhuUkybV6tmYzzA11WcB";
const TRUSTLINE_URL = "https://xpmarket.com/trustline/XMETA-r3XwJ1hr1PtbRvbhuUkybV6tmYzzA11WcB/set";

const apiKey = import.meta.env.VITE_OPENAI_API_KEY || "";

const ROADMAP_STEPS = [
    { phase: "Phase 1", title: "Mobilization", desc: "Community CTO activation, DAO Formation, Trustline snapshot.", status: "current" },
    { phase: "Phase 2", title: "Rebuild", desc: "Website 2.0, Whitepaper V2, Smart Contract Audit.", status: "upcoming" },
    { phase: "Phase 3", title: "Launch", desc: "XPlanets Drop, AI World Builder Beta, Arcade Release.", status: "upcoming" },
    { phase: "Phase 4", title: "Expansion", desc: "Full Metaverse Live, Cross-chain bridges, VR Support.", status: "upcoming" },
];

const FEATURES = [
    { icon: <Box className="w-6 h-6" />, title: "Create", desc: "Build 3D planets & creatures using generative AI tools." },
    { icon: <Zap className="w-6 h-6" />, title: "Earn", desc: "Royalties, staking rewards, and P2P asset trading on XRPL." },
    { icon: <Gamepad2 className="w-6 h-6" />, title: "Play", desc: "Arcade quests, space battles, and exploration missions." },
    { icon: <Terminal className="w-6 h-6" />, title: "Learn", desc: "Master DeFi, DAO governance, and coding inside the verse." },
];

const NFTS = [
    { name: "XPlanet Alpha", type: "Land", rarity: "Legendary", color: "from-purple-500 to-pink-500" },
    { name: "XGalaxian #402", type: "Avatar", rarity: "Rare", color: "from-blue-500 to-cyan-500" },
    { name: "Interceptor V2", type: "Ship", rarity: "Epic", color: "from-orange-500 to-red-500" },
    { name: "Neon District", type: "Zone", rarity: "Common", color: "from-green-500 to-emerald-500" },
];

// --- Helper Functions ---

const callOpenAI = async (prompt, systemPrompt) => {
    try {
        const response = await fetch(
            'https://api.openai.com/v1/chat/completions',
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: "gpt-4o-mini",
                    messages: [
                        { role: "system", content: systemPrompt },
                        { role: "user", content: prompt }
                    ],
                    response_format: { type: "json_object" }
                }),
            }
        );

        if (!response.ok) throw new Error(`API Error: ${response.status}`);
        const data = await response.json();
        const text = data.choices?.[0]?.message?.content;
        return text ? JSON.parse(text) : null;
    } catch (error) {
        console.error("OpenAI API Error:", error);
        return null;
    }
};

const callOpenAIText = async (prompt, systemPrompt) => {
    try {
        const response = await fetch(
            'https://api.openai.com/v1/chat/completions',
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: "gpt-4o-mini",
                    messages: [
                        { role: "system", content: systemPrompt },
                        { role: "user", content: prompt }
                    ]
                }),
            }
        );

        if (!response.ok) throw new Error(`API Error: ${response.status}`);
        const data = await response.json();
        return data.choices?.[0]?.message?.content || "System Error.";
    } catch (error) {
        console.error("OpenAI API Error:", error);
        return "Communication link disrupted.";
    }
};

const speakText = async (text) => {
    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: text }] }],
                    generationConfig: {
                        responseModalities: ["AUDIO"],
                        speechConfig: {
                            voiceConfig: {
                                prebuiltVoiceConfig: { voiceName: "Fenrir" },
                            },
                        },
                    },
                }),
            }
        );

        if (!response.ok) throw new Error(`TTS API Error: ${response.status}`);
        const data = await response.json();
        const audioContent = data.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

        if (audioContent) {
            const audioBytes = Uint8Array.from(atob(audioContent), c => c.charCodeAt(0));
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const sampleRate = 24000;
            const buffer = audioContext.createBuffer(1, audioBytes.length / 2, sampleRate);
            const channelData = buffer.getChannelData(0);
            const view = new DataView(audioBytes.buffer);
            for (let i = 0; i < audioBytes.length / 2; i++) {
                const sample = view.getInt16(i * 2, true);
                channelData[i] = sample / 32768;
            }
            const source = audioContext.createBufferSource();
            source.buffer = buffer;
            source.connect(audioContext.destination);
            source.start(0);
        }
    } catch (error) {
        console.error("TTS Error:", error);
    }
};

// --- Components ---

/**
 * TronGridBackground
 * A high-performance canvas animation simulating a 3D retro-synthwave grid
 * moving towards a horizon line.
 */
const TronGridBackground = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let width, height;
        let animationFrameId;
        let time = 0;

        const init = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        };

        const draw = () => {
            time += 0.002;
            ctx.fillStyle = '#020617'; // Deep void background
            ctx.fillRect(0, 0, width, height);

            const horizonY = height * 0.45; // Horizon line position
            const cx = width / 2;
            const cy = horizonY;

            // 1. Draw Sun/Glow at Horizon
            const gradient = ctx.createRadialGradient(cx, cy, 10, cx, cy + 100, 600);
            gradient.addColorStop(0, 'rgba(236, 72, 153, 0.3)'); // Pink core
            gradient.addColorStop(0.5, 'rgba(6, 182, 212, 0.1)'); // Cyan mid
            gradient.addColorStop(1, 'transparent');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);

            // 2. Draw Perspective Vertical Lines
            ctx.strokeStyle = 'rgba(236, 72, 153, 0.3)'; // Pink/Magenta Lines
            ctx.lineWidth = 1;
            ctx.beginPath();

            const fov = 300;
            const spacing = 80;
            // Draw lines radiating from center (vanishing point is slightly above horizon for effect)
            for (let x = -width; x < width * 2; x += spacing) {
                // Calculate perspective
                // Simple radial approach for retro feel
                const dx = x - cx;
                // Slant factor
                ctx.moveTo(cx, cy);
                // Project out to bottom
                ctx.lineTo(x + dx * 4, height);
            }
            ctx.stroke();

            // 3. Draw Moving Horizontal Lines (The Grid Floor)
            // Uses exponential z-depth to simulate 3D movement
            ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)'; // Cyan Lines
            ctx.lineWidth = 1.5;
            ctx.shadowBlur = 4;
            ctx.shadowColor = '#06b6d4';

            const floorHeight = height - horizonY;

            // Loop to draw horizontal lines moving "forward"
            // We map 0..1 progress to exponential screen Y
            for (let i = 0; i < 20; i++) {
                // Calculate phase (0 to 1) based on time
                let progress = (time + i / 20) % 1;

                // Perspective transform: z goes from far (0) to near (1)
                // Screen Y = horizon + (distance * progress^2)
                // Using square or cubic makes lines cluster at horizon
                const y = horizonY + (progress * progress * progress * floorHeight);

                // Fade out near horizon, fade out very close to camera
                const alpha = progress < 0.1 ? progress * 10 : (progress > 0.8 ? (1 - progress) * 5 : 1);

                ctx.globalAlpha = alpha;
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(width, y);
                ctx.stroke();
            }
            ctx.globalAlpha = 1;
            ctx.shadowBlur = 0;

            // 4. Retro Scanline Overlay
            ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
            for (let y = 0; y < height; y += 4) {
                ctx.fillRect(0, y, width, 1);
            }

            animationFrameId = requestAnimationFrame(draw);
        };

        window.addEventListener('resize', init);
        init();
        draw();

        return () => {
            window.removeEventListener('resize', init);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed top-0 left-0 w-full h-full -z-10 bg-[#020617]"
        />
    );
};

const Header = ({ isConnected, onConnect }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <nav className="fixed top-0 w-full z-50 bg-black/40 backdrop-blur-xl border-b border-white/10 supports-[backdrop-filter]:bg-black/20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    <div className="flex items-center gap-3 group cursor-pointer">
                        {/* Ambient Logo Halo */}
                        <div className="relative">
                            <div className="absolute inset-0 bg-pink-500 rounded-full blur-md opacity-40 group-hover:opacity-60 transition-opacity duration-500 animate-pulse-slow"></div>
                            <Rocket className="relative h-8 w-8 text-white z-10 drop-shadow-[0_0_10px_rgba(236,72,153,0.8)]" />
                        </div>
                        <span className="text-2xl font-black tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-200 to-cyan-400 group-hover:to-white transition-all drop-shadow-[0_0_5px_rgba(6,182,212,0.5)]">
                            XMETA
                        </span>
                    </div>

                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-8">
                            <a href="#vision" className="hover:text-pink-400 text-gray-300 px-3 py-2 rounded-md text-sm font-bold tracking-wide transition-all hover:drop-shadow-[0_0_8px_rgba(236,72,153,0.8)]">VISION</a>
                            <a href="#game-center" className="text-cyan-400 hover:text-white px-4 py-2 rounded-full text-sm font-black tracking-wide transition-all flex items-center gap-2 border border-cyan-500/50 bg-cyan-500/10 hover:bg-cyan-500/20 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)]">
                                <Crosshair className="w-4 h-4" /> PLAY
                            </a>
                            <a href="#ai-deck" className="hover:text-purple-400 text-gray-300 px-3 py-2 rounded-md text-sm font-bold tracking-wide transition-all hover:drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]">AI DECK</a>
                            <a href="#creator" className="hover:text-green-400 text-gray-300 px-3 py-2 rounded-md text-sm font-bold tracking-wide transition-all hover:drop-shadow-[0_0_8px_rgba(34,197,94,0.8)]">CREATOR</a>
                        </div>
                    </div>

                    <div className="hidden md:block">
                        <button
                            onClick={onConnect}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-bold transition-all ${isConnected
                                ? 'bg-green-900/20 text-green-400 border border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.2)]'
                                : 'bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white shadow-[0_0_20px_rgba(236,72,153,0.4)] hover:shadow-[0_0_30px_rgba(236,72,153,0.6)] border border-white/10'
                                }`}
                        >
                            <Wallet className="w-4 h-4" />
                            {isConnected ? 'r3Xw...Connected' : 'CONNECT WALLET'}
                        </button>
                    </div>

                    <div className="-mr-2 flex md:hidden">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-white/10 focus:outline-none"
                        >
                            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {isMenuOpen && (
                <div className="md:hidden bg-[#0a0a0f]/95 backdrop-blur-xl border-b border-white/10 animate-in slide-in-from-top-5 duration-200">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        <a href="#game-center" onClick={() => setIsMenuOpen(false)} className="block px-3 py-3 rounded-md text-base font-black text-cyan-400 hover:bg-cyan-900/20 border border-cyan-500/30 bg-cyan-900/10 mb-2 text-center shadow-[0_0_15px_rgba(6,182,212,0.2)]">PLAY TANK ARENA</a>
                        <a href="#vision" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-bold text-gray-300 hover:text-white hover:bg-white/5">VISION</a>
                        <a href="#ai-deck" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-bold text-gray-300 hover:text-white hover:bg-white/5">AI DECK</a>
                        <a href="#creator" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-bold text-gray-300 hover:text-white hover:bg-white/5">CREATOR HUB</a>
                        <button
                            onClick={() => { onConnect(); setIsMenuOpen(false); }}
                            className="w-full text-center mt-4 flex justify-center items-center gap-2 px-3 py-4 rounded-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 text-white border border-white/10 shadow-lg"
                        >
                            <Wallet className="w-5 h-5" />
                            {isConnected ? 'Wallet Connected' : 'Connect Xaman'}
                        </button>
                    </div>
                </div>
            )}
        </nav>
    );
};

const TrustlineCounter = () => {
    const [count, setCount] = useState(18000);

    useEffect(() => {
        const interval = setInterval(() => {
            setCount(prev => {
                if (prev >= 19042) {
                    clearInterval(interval);
                    return 19042;
                }
                return prev + 17;
            });
        }, 20);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="inline-flex items-center gap-3 bg-black/40 border border-green-500/30 backdrop-blur-md rounded-full px-6 py-2 mb-8 animate-fade-in shadow-[0_0_15px_rgba(34,197,94,0.15)]">
            <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <span className="text-sm font-mono text-green-100 tracking-widest uppercase">
                <span className="text-white font-black text-lg mr-2">{count.toLocaleString()}</span>
                Trustlines Active
            </span>
        </div>
    );
};

// --- TANK GAME COMPONENTS (3D FPS) ---

const TankGame = ({ onScore, onHit }) => {
    const containerRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isGlitching, setIsGlitching] = useState(false);
    const engineRef = useRef(null); // Store THREE.js instances

    useEffect(() => {
        if (!isPlaying) return;

        // Dynamically load Three.js
        let script;
        if (!window.THREE) {
            script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
            script.async = true;
            script.onload = () => {
                initThreeJS();
            };
            document.body.appendChild(script);
        } else {
            initThreeJS();
        }

        return () => {
            if (script) document.body.removeChild(script);
            if (engineRef.current) {
                // Cleanup Three.js logic here (simplified)
                engineRef.current.stop();
            }
        };
    }, [isPlaying]);

    const triggerGlitch = () => {
        setIsGlitching(true);
        onHit(); // Parent handles score deduction
        setTimeout(() => setIsGlitching(false), 300);
    }

    const initThreeJS = () => {
        const THREE = window.THREE;
        const container = containerRef.current;
        if (!container) return;

        // 1. SCENE
        const scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x000000, 0.02);

        const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
        // Position camera "inside" the tank turret
        camera.position.set(0, 1.5, 0);

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(container.clientWidth, container.clientHeight);
        container.innerHTML = ''; // Clear loading text
        container.appendChild(renderer.domElement);

        // 2. WORLD (Neon Grid)
        const gridHelper = new THREE.GridHelper(200, 50, 0xff00ff, 0x00ffff);
        scene.add(gridHelper);

        // Floating Stars
        const starsGeometry = new THREE.BufferGeometry();
        const starsMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.5 });
        const starVertices = [];
        for (let i = 0; i < 500; i++) {
            starVertices.push((Math.random() - 0.5) * 200);
            starVertices.push(Math.random() * 50);
            starVertices.push((Math.random() - 0.5) * 200);
        }
        starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
        const stars = new THREE.Points(starsGeometry, starsMaterial);
        scene.add(stars);

        // 3. PLAYER TANK (Invisible logic, visible only as gun barrel in front of cam)
        const player = {
            x: 0, z: 0, rot: 0,
            speed: 0, turnSpeed: 0
        };

        // HUD / Barrel Model attached to Camera
        const gunGeometry = new THREE.BoxGeometry(0.2, 0.2, 2);
        const gunMaterial = new THREE.MeshBasicMaterial({ color: 0x00ffff, wireframe: true });
        const gun = new THREE.Mesh(gunGeometry, gunMaterial);
        gun.position.set(0.5, -0.5, -1.5); // Lower right of screen
        camera.add(gun); // Attach to camera so it moves with look
        scene.add(camera); // Add camera to scene

        // 4. ENEMIES
        const enemies = [];
        const enemyGeo = new THREE.IcosahedronGeometry(1, 0);
        const enemyMat = new THREE.MeshBasicMaterial({ color: 0xff0055, wireframe: true });

        const spawnEnemy = () => {
            const mesh = new THREE.Mesh(enemyGeo, enemyMat.clone());
            const angle = Math.random() * Math.PI * 2;
            const dist = 40 + Math.random() * 20;
            mesh.position.set(Math.cos(angle) * dist, 2, Math.sin(angle) * dist);
            scene.add(mesh);
            enemies.push({ mesh, hp: 1, lastShot: 0 });
        };

        for (let i = 0; i < 4; i++) spawnEnemy();

        // 5. PROJECTILES (Player & Enemy)
        const bullets = [];
        const bulletGeo = new THREE.SphereGeometry(0.2, 8, 8);
        const playerBulletMat = new THREE.MeshBasicMaterial({ color: 0x00ffff });
        const enemyBulletMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });

        const shoot = (origin, quaternion, isPlayer) => {
            const mesh = new THREE.Mesh(bulletGeo, isPlayer ? playerBulletMat : enemyBulletMat);
            mesh.position.copy(origin);
            mesh.quaternion.copy(quaternion);
            scene.add(mesh);
            bullets.push({ mesh, velocity: new THREE.Vector3(0, 0, -1).applyQuaternion(quaternion).multiplyScalar(1.5), isPlayer, life: 100 });
        };

        // 6. INPUTS
        const keys = { w: false, a: false, s: false, d: false };
        const onKeyDown = (e) => keys[e.key.toLowerCase()] = true;
        const onKeyUp = (e) => keys[e.key.toLowerCase()] = false;

        // Mouse Look Logic
        let mouseX = 0;
        const onMouseMove = (e) => {
            // Simple normalized mouse X for turning view
            mouseX = (e.clientX / container.clientWidth) * 2 - 1;
        };

        const onClick = () => {
            // Shoot from camera position
            const bulletStart = camera.position.clone();
            bulletStart.y -= 0.5; // Slightly below eye level
            shoot(bulletStart, camera.quaternion, true);

            // Gun recoil
            gun.position.z = -1.0;
        };

        window.addEventListener('keydown', onKeyDown);
        window.addEventListener('keyup', onKeyUp);
        container.addEventListener('mousemove', onMouseMove);
        container.addEventListener('mousedown', onClick);

        // 7. GAME LOOP
        let animationId;
        const animate = () => {
            animationId = requestAnimationFrame(animate);

            // --- PLAYER MOVEMENT (Tank Controls) ---
            // Turn tank
            if (keys.a) player.rot += 0.04;
            if (keys.d) player.rot -= 0.04;

            // Move tank
            if (keys.w) {
                player.x -= Math.sin(player.rot) * 0.3;
                player.z -= Math.cos(player.rot) * 0.3;
            }
            if (keys.s) {
                player.x += Math.sin(player.rot) * 0.2;
                player.z += Math.cos(player.rot) * 0.2;
            }

            // Camera Follows Tank Position
            camera.position.x = player.x;
            camera.position.z = player.z;

            // Camera Look (Tank Rotation + Mouse Offset for Turret feel)
            // We use simple rotation for FPS feel without gimbal lock issues in this simple demo
            const turretAngle = player.rot + (mouseX * 1.5); // Mouse influences view
            camera.rotation.y = turretAngle;

            // Gun Recoil Recovery
            gun.position.z += (-1.5 - gun.position.z) * 0.1;

            // --- BULLETS ---
            for (let i = bullets.length - 1; i >= 0; i--) {
                const b = bullets[i];
                b.mesh.position.add(b.velocity);
                b.life--;

                // Collisions
                if (b.isPlayer) {
                    // Hit Enemy?
                    for (let j = enemies.length - 1; j >= 0; j--) {
                        const e = enemies[j];
                        if (b.mesh.position.distanceTo(e.mesh.position) < 2) {
                            // Hit!
                            scene.remove(e.mesh);
                            enemies.splice(j, 1);
                            scene.remove(b.mesh);
                            bullets.splice(i, 1);
                            spawnEnemy();
                            onScore(100);
                            break;
                        }
                    }
                } else {
                    // Hit Player?
                    if (b.mesh.position.distanceTo(camera.position) < 1.5) {
                        triggerGlitch();
                        scene.remove(b.mesh);
                        bullets.splice(i, 1);
                    }
                }

                if (b.life <= 0 && b.mesh.parent) {
                    scene.remove(b.mesh);
                    bullets.splice(i, 1);
                }
            }

            // --- ENEMIES ---
            enemies.forEach(e => {
                e.mesh.rotation.x += 0.01;
                e.mesh.rotation.y += 0.01;

                // Move towards player
                const dir = new THREE.Vector3(player.x - e.mesh.position.x, 0, player.z - e.mesh.position.z).normalize();
                e.mesh.position.add(dir.multiplyScalar(0.05));

                // Shoot at player
                e.lastShot++;
                if (e.lastShot > 100 && Math.random() > 0.95) {
                    e.lastShot = 0;
                    const lookAtPlayer = new THREE.Matrix4();
                    // Simple logic to orient bullet towards player
                    const targetPos = camera.position.clone();
                    targetPos.y -= 0.5; // Aim at body

                    const dummy = new THREE.Object3D();
                    dummy.position.copy(e.mesh.position);
                    dummy.lookAt(targetPos);
                    shoot(e.mesh.position, dummy.quaternion, false);
                }
            });

            renderer.render(scene, camera);
        };

        animate();

        engineRef.current = {
            stop: () => {
                cancelAnimationFrame(animationId);
                window.removeEventListener('keydown', onKeyDown);
                window.removeEventListener('keyup', onKeyUp);
                container.removeEventListener('mousemove', onMouseMove);
                container.removeEventListener('mousedown', onClick);
            }
        };
    };

    return (
        <div className="relative w-full h-[500px] bg-black/90 rounded-xl overflow-hidden border border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.1)] group">
            {!isPlaying ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm z-10 p-6 text-center">
                    <div className="relative mb-6">
                        <div className="absolute inset-0 bg-cyan-500 blur-xl opacity-20 animate-pulse"></div>
                        <Target className="w-20 h-20 text-cyan-400 relative z-10" />
                    </div>
                    <h3 className="text-3xl font-black text-white mb-2 tracking-tighter italic">NEON TANK ARENA 3D</h3>
                    <div className="flex gap-4 mb-8 text-sm text-gray-400 bg-white/5 p-4 rounded-lg border border-white/10">
                        <div className="flex flex-col items-center"><span className="text-white font-bold border border-white/20 px-2 rounded mb-1">W / S</span> <span>Drive</span></div>
                        <div className="flex flex-col items-center"><span className="text-white font-bold border border-white/20 px-2 rounded mb-1">A / D</span> <span>Turn</span></div>
                        <div className="flex flex-col items-center"><span className="text-white font-bold border border-white/20 px-2 rounded mb-1">MOUSE</span> <span>Aim Turret</span></div>
                        <div className="flex flex-col items-center"><span className="text-white font-bold border border-white/20 px-2 rounded mb-1">CLICK</span> <span>Fire</span></div>
                    </div>
                    <button
                        onClick={() => setIsPlaying(true)}
                        className="px-10 py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-lg rounded-full transition-all shadow-[0_0_20px_rgba(8,145,178,0.5)] hover:scale-105"
                    >
                        ENTER SIMULATION
                    </button>
                </div>
            ) : (
                <div className="absolute top-4 left-4 z-10 pointer-events-none">
                    <div className="bg-black/50 px-3 py-1 rounded border border-cyan-500/30 text-xs text-cyan-400 font-mono mb-1">
                        SYSTEMS ONLINE
                    </div>
                    <div className="text-white/50 text-[10px]">WASD to Move â€¢ Click to Shoot</div>
                </div>
            )}

            {/* Glitch Overlay */}
            {isGlitching && (
                <div className="absolute inset-0 z-50 bg-red-500/20 pointer-events-none animate-pulse mix-blend-overlay">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-red-500 font-black text-6xl tracking-tighter">WARNING</div>
                </div>
            )}

            <div ref={containerRef} className="w-full h-full cursor-crosshair" />
        </div>
    );
};
const GameDashboard = ({ address }) => {
    const [score, setScore] = useState(0);
    const [pendingRewards, setPendingRewards] = useState(0);
    const [isClaiming, setIsClaiming] = useState(false);
    const [aiAnalysis, setAiAnalysis] = useState(null);
    const [loadingAi, setLoadingAi] = useState(false);

    // Score conversion rate: 100 points = 0.00001 XMETA
    // Therefore 1 point = 0.0000001 XMETA
    const handleScore = (points) => {
        setScore(prev => prev + points);
        setPendingRewards(prev => prev + (points * 0.0000001));
    };

    const handleHit = () => {
        setScore(prev => Math.max(0, prev - 50)); // Penalty for getting hit
    };

    const handleClaim = async () => {
        if (pendingRewards <= 0) return;
        setIsClaiming(true);

        try {
            const xumm = getXummInstance();
            // Convert amount to string for memo
            const amountStr = pendingRewards.toFixed(7);
            const memoData = `CLAIM:${amountStr}`;
            // Simple hex conversion
            const memoHex = Array.from(memoData).map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join('').toUpperCase();

            const payload = {
                TransactionType: 'Payment',
                Destination: CLAIM_WALLET,
                Amount: '1', // 1 drop XRP
                Memos: [
                    {
                        Memo: {
                            MemoData: memoHex
                        }
                    }
                ]
            };

            console.log("Creating payload via Netlify Function...", payload);

            const endpoint = '/.netlify/functions/create-payload';

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Xumm API Error: ${response.status} ${errorText}`);
            }

            const result = await response.json();
            console.log("Payload result:", result);

            if (result?.next?.always) {
                console.log("Opening URL:", result.next.always);
                window.open(result.next.always, '_blank');
            } else {
                console.warn("No next.always URL in result:", result);
                alert("Claim created but no URL returned. Check console.");
            }

            // Optimistic reset
            setScore(0);
            setPendingRewards(0);
        } catch (error) {
            console.error("Claim Error Object:", error);
            console.error("Claim Error Message:", error.message);
            console.error("Claim Error Stack:", error.stack);
            alert(`Failed to initiate claim. Error: ${error.message || "Unknown error"}`);
        } finally {
            setIsClaiming(false);
        }
    };

    const getTacticalAnalysis = async () => {
        setLoadingAi(true);
        const prompt = "Generate a short tactical analysis for a high-speed hover tank on a neon grid map. Suggest a weakness.";
        const systemPrompt = "You are a military AI in the XGalaxies universe. Provide a concise tactical tip.";
        const text = await callOpenAIText(prompt, systemPrompt);
        setAiAnalysis(text);
        setLoadingAi(false);
    };

    return (
        <div id="game-center" className="py-24 bg-[#050510] relative border-y border-cyan-900/30 overflow-hidden">
            {/* Background Grid FX */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-4 relative z-10">
                <div className="flex items-center gap-3 mb-8">
                    <Gamepad2 className="w-8 h-8 text-cyan-400" />
                    <div>
                        <h2 className="text-4xl font-bold text-white tracking-tight">NEON TANK ARENA <span className="text-cyan-600 text-lg align-top ml-2">3D</span></h2>
                        <p className="text-gray-400">Pilot your tank in a 3D simulation. Survive the grid. Earn XMETA.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: Game Canvas */}
                    <div className="lg:col-span-2">
                        <TankGame onScore={handleScore} onHit={handleHit} />

                        {/* Tactical AI Bar */}
                        <div className="mt-4 bg-cyan-900/10 border border-cyan-500/20 rounded-xl p-4 flex items-start gap-4">
                            <div className="p-2 bg-cyan-500/10 rounded-lg">
                                <Cpu className="w-5 h-5 text-cyan-400" />
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-center mb-1">
                                    <h4 className="font-bold text-white text-sm">TACTICAL AI ASSISTANT</h4>
                                    <button
                                        onClick={getTacticalAnalysis}
                                        disabled={loadingAi}
                                        className="text-xs text-cyan-400 hover:text-white underline"
                                    >
                                        {loadingAi ? 'ANALYZING...' : 'GET NEW STRATEGY'}
                                    </button>
                                </div>
                                <p className="text-sm text-cyan-200/80 font-mono leading-relaxed">
                                    {aiAnalysis || "System Online. Request tactical analysis for combat advantages..."}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right: Stats & Claims */}
                    <div className="bg-[#0a0a14] border border-white/10 rounded-xl p-6 flex flex-col h-full shadow-2xl">
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <Trophy className="w-5 h-5 text-yellow-500" />
                            Session Earnings
                        </h3>

                        <div className="space-y-6 flex-1">
                            {/* Score Card */}
                            <div className="bg-white/5 p-4 rounded-lg border border-white/5">
                                <span className="text-gray-500 text-xs uppercase font-bold tracking-wider">Current Score</span>
                                <div className="text-3xl font-mono font-bold text-white">{score.toLocaleString()}</div>
                            </div>

                            {/* Conversion Arrow */}
                            <div className="flex justify-center -my-2 opacity-50">
                                <ArrowRight className="w-6 h-6 text-gray-500 rotate-90" />
                            </div>

                            {/* Pending Rewards */}
                            <div className="bg-gradient-to-br from-cyan-900/30 to-blue-900/30 p-4 rounded-lg border border-cyan-500/30 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-20 h-20 bg-cyan-500/20 blur-2xl rounded-full -mr-10 -mt-10"></div>
                                <span className="text-cyan-400 text-xs uppercase font-bold tracking-wider mb-1 block">Pending Rewards</span>
                                <div className="text-4xl font-mono font-bold text-white mb-1">{pendingRewards.toFixed(7)} <span className="text-lg text-gray-400">XMETA</span></div>
                                <p className="text-[10px] text-gray-400">Rate: 100 Pts = 0.00001 XMETA</p>
                            </div>
                        </div>

                        {/* Claim Action */}
                        <div className="mt-8">
                            <button
                                onClick={handleClaim}
                                disabled={pendingRewards === 0 || isClaiming}
                                className="w-full py-4 bg-green-600 hover:bg-green-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-lg shadow-green-900/20 flex items-center justify-center gap-2 group"
                            >
                                {isClaiming ? <Loader className="w-5 h-5 animate-spin" /> : <Coins className="w-5 h-5 group-hover:rotate-12 transition-transform" />}
                                {isClaiming ? 'SIGNING...' : 'CLAIM TO WALLET'}
                            </button>
                            <p className="text-center mt-3 text-[10px] text-gray-500">
                                Triggers Xaman sign request. 1 drop XRP network fee applies.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- GEMINI POWERED COMPONENTS ---

const AIGenerator = () => {
    const [prompt, setPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [result, setResult] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const handleGenerate = async (e) => {
        e.preventDefault();
        if (!prompt) return;
        setIsGenerating(true);
        setResult(null);

        const systemPrompt = `You are a sci-fi world generator for the XMeta XGalaxies metaverse. 
    Generate a JSON object for a unique planet or cosmic entity based on the user's input.
    The JSON structure must be:
    {
      "name": "Creative Name",
      "type": "Planet Type (e.g. Ice Giant, Dyson Sphere)",
      "rarity": "Common | Rare | Epic | Legendary",
      "resources": ["Resource1", "Resource2"],
      "description": "A short, immersive description of the location (max 30 words)."
    }`;

        const data = await callOpenAI(prompt, systemPrompt);

        if (data) {
            setResult(data);
        } else {
            setResult({
                name: "Connection Error Planet",
                type: "Glitch Anomaly",
                rarity: "Common",
                resources: ["Static", "Void Dust"],
                description: "Communication with the deep space scanners failed. Please try again."
            });
        }
        setIsGenerating(false);
    };

    const handleSpeak = async () => {
        if (!result?.description || isPlaying) return;
        setIsPlaying(true);
        await speakText(`Planet discovery confirmed. ${result.name}. ${result.description}`);
        setIsPlaying(false);
    };

    return (
        <div className="bg-black/30 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-6 md:p-8 w-full shadow-2xl shadow-cyan-900/20 relative overflow-hidden flex flex-col h-full transition-transform hover:scale-[1.01]">
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-600/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>

            <div className="flex items-center gap-2 mb-4">
                <Globe className="w-5 h-5 text-cyan-400" />
                <h3 className="text-xl font-bold text-white">✨ AI World Engine</h3>
            </div>
            <p className="text-gray-400 mb-6 text-sm flex-grow">
                Powered by OpenAI GPT-4o. Describe a planet to mint its blueprint.
            </p>

            {!result ? (
                <form onSubmit={handleGenerate} className="relative mt-auto">
                    <input
                        type="text"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Ex: An obsidian planet raining neon..."
                        className="w-full bg-black/50 border border-white/20 rounded-xl py-4 pl-4 pr-32 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                    />
                    <button
                        type="submit"
                        disabled={isGenerating}
                        className="absolute right-2 top-2 bottom-2 bg-cyan-600 hover:bg-cyan-500 text-white px-4 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isGenerating ? <Loader className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        {isGenerating ? 'Scanning...' : 'Generate'}
                    </button>
                </form>
            ) : (
                <div className="animate-in fade-in zoom-in duration-300 mt-auto">
                    <div className="bg-gradient-to-br from-cyan-900/50 to-purple-900/50 border border-white/20 rounded-xl p-4 gap-4 relative">
                        <button
                            onClick={() => { setResult(null); setPrompt(''); }}
                            className="absolute top-2 right-2 p-1 hover:bg-white/10 rounded-full transition-colors z-10"
                        >
                            <X className="w-4 h-4 text-gray-400" />
                        </button>

                        <div className="flex items-start gap-4">
                            <div className="w-16 h-16 rounded-lg bg-gradient-to-tr from-cyan-400 to-purple-500 flex items-center justify-center shadow-lg shadow-cyan-500/20 shrink-0">
                                <Globe className="w-8 h-8 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-lg font-bold text-white truncate">{result.name}</h4>
                                <p className="text-cyan-300 text-xs uppercase font-bold tracking-wider mb-1">{result.rarity} // {result.type}</p>
                                <p className="text-gray-300 text-sm italic leading-tight mb-2">"{result.description}"</p>
                                <div className="flex flex-wrap gap-2">
                                    {result.resources.map(r => (
                                        <span key={r} className="text-[10px] bg-black/40 border border-white/10 px-2 py-1 rounded text-gray-400">{r}</span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2 mt-4">
                            <button onClick={handleSpeak} disabled={isPlaying} className="flex-1 flex items-center justify-center gap-2 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold text-cyan-200 transition-colors border border-white/10">
                                {isPlaying ? <Loader className="w-3 h-3 animate-spin" /> : <Volume2 className="w-3 h-3" />}
                                Broadcast Lore
                            </button>
                            <button className="flex-1 py-2 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-400 rounded-lg text-xs font-bold transition-colors border border-cyan-500/30">
                                Mint NFT
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const MissionGenerator = () => {
    const [loading, setLoading] = useState(false);
    const [mission, setMission] = useState(null);

    const generateMission = async () => {
        setLoading(true);
        const systemPrompt = `You are a mission control officer for the XMeta metaverse. 
        Generate a JSON object for a daily player mission.
        JSON Structure:
        {
            "title": "Operation Name",
            "objective": "Clear instructions on what to do.",
            "difficulty": "Easy | Medium | Hard",
            "reward": "Amount in XMETA",
            "flavor": "A single sentence of dramatic briefing context."
        }`;

        const data = await callOpenAI("Generate a random sci-fi mission.", systemPrompt);
        setMission(data);
        setLoading(false);
    };

    return (
        <div className="bg-black/30 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-6 md:p-8 w-full shadow-2xl shadow-purple-900/20 relative overflow-hidden flex flex-col h-full transition-transform hover:scale-[1.01]">
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>

            <div className="flex items-center gap-2 mb-4">
                <TargetIcon className="w-5 h-5 text-purple-400" />
                <h3 className="text-xl font-bold text-white">✨ Oracle Missions</h3>
            </div>
            <p className="text-gray-400 mb-6 text-sm flex-grow">
                Ask the Oracle AI for a procedurally generated quest to earn XMETA.
            </p>

            {!mission ? (
                <div className="mt-auto flex justify-center">
                    <button
                        onClick={generateMission}
                        disabled={loading}
                        className="w-full py-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition-all shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                        {loading ? 'Receiving Transmission...' : '✨ Request Mission'}
                    </button>
                </div>
            ) : (
                <div className="mt-auto animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 border border-white/20 rounded-xl p-5 relative">
                        <button
                            onClick={() => setMission(null)}
                            className="absolute top-2 right-2 p-1 hover:bg-white/10 rounded-full transition-colors"
                        >
                            <X className="w-4 h-4 text-gray-400" />
                        </button>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase border ${mission.difficulty === 'Hard' ? 'bg-red-500/20 text-red-300 border-red-500/30' :
                            mission.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' :
                                'bg-green-500/20 text-green-300 border-green-500/30'
                            }`}>
                            {mission.difficulty}
                        </span>
                        <h4 className="text-xl font-bold text-white mt-2">{mission.title}</h4>
                        <p className="text-purple-200 text-sm mt-1 mb-3">"{mission.flavor}"</p>

                        <div className="bg-black/40 rounded p-3 mb-3 border border-white/5">
                            <p className="text-xs text-gray-400 uppercase font-bold">Objective</p>
                            <p className="text-sm text-white">{mission.objective}</p>
                        </div>

                        <div className="flex justify-between items-center">
                            <div className="text-xs text-gray-400">Reward Pool</div>
                            <div className="text-yellow-400 font-bold font-mono">{mission.reward}</div>
                        </div>

                        <button className="w-full mt-4 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg text-sm font-bold transition-colors">
                            Accept Mission
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

const AlienDiplomat = () => {
    const [phase, setPhase] = useState('scan'); // scan, negotiate, result
    const [alien, setAlien] = useState(null);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    const scanSpace = async () => {
        setLoading(true);
        const systemPrompt = `You are a sci-fi game master. Generate a random alien encounter.
        JSON: { "species": "Name", "appearance": "Visual description", "temperament": "Aggressive/Peaceful/Trade-focused", "message": "Initial greeting in broken English" }`;
        const data = await callGemini("Scan for lifeforms.", systemPrompt);
        setAlien(data);
        setPhase('negotiate');
        setLoading(false);
    };

    const negotiate = async () => {
        if (!input) return;
        setLoading(true);
        const systemPrompt = `You are a game master resolving a negotiation with the ${alien.species} (${alien.temperament}). 
        The player said: "${input}".
        Decide the outcome. JSON: { "outcome": "Alliance | Trade Deal | War Declared", "response": "Alien's reply", "consequence": "What happens next (e.g. receive tech, ship damaged)" }`;
        const data = await callGemini("Resolve negotiation.", systemPrompt);
        setResult(data);
        setPhase('result');
        setLoading(false);
    };

    const reset = () => {
        setPhase('scan');
        setAlien(null);
        setResult(null);
        setInput("");
    };

    return (
        <div className="bg-black/30 backdrop-blur-xl border border-green-500/30 rounded-2xl p-6 md:p-8 w-full shadow-2xl shadow-green-900/20 relative overflow-hidden flex flex-col h-full transition-transform hover:scale-[1.01]">
            <div className="absolute top-0 right-0 w-64 h-64 bg-green-600/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>

            <div className="flex items-center gap-2 mb-4">
                <Handshake className="w-5 h-5 text-green-400" />
                <h3 className="text-xl font-bold text-white">✨ Alien Diplomacy</h3>
            </div>

            {phase === 'scan' && (
                <div className="flex flex-col h-full justify-between">
                    <p className="text-gray-400 text-sm">Scan deep space frequencies for first contact opportunities. Risks included.</p>
                    <button onClick={scanSpace} disabled={loading} className="w-full py-3 rounded-lg bg-green-600 hover:bg-green-500 text-white font-bold transition-all flex items-center justify-center gap-2">
                        {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Radio className="w-4 h-4" />}
                        {loading ? 'Scanning...' : 'Scan Sector'}
                    </button>
                </div>
            )}

            {phase === 'negotiate' && alien && (
                <div className="flex flex-col h-full animate-in fade-in">
                    <div className="bg-green-900/20 border border-green-500/30 rounded-xl p-4 mb-4 flex-grow">
                        <h4 className="text-green-400 font-bold text-lg mb-1">{alien.species}</h4>
                        <span className="text-xs bg-green-500/20 text-green-300 px-2 py-0.5 rounded uppercase mb-2 inline-block">{alien.temperament}</span>
                        <p className="text-sm text-gray-300 italic mb-2">"{alien.message}"</p>
                        <p className="text-xs text-gray-500">{alien.appearance}</p>
                    </div>
                    <div className="flex gap-2">
                        <input
                            value={input} onChange={(e) => setInput(e.target.value)}
                            className="flex-1 bg-black/50 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-green-500"
                            placeholder="Type your greeting..."
                        />
                        <button onClick={negotiate} disabled={loading} className="bg-green-600 hover:bg-green-500 px-4 rounded-lg text-white">
                            {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        </button>
                    </div>
                </div>
            )}

            {phase === 'result' && result && (
                <div className="flex flex-col h-full animate-in fade-in">
                    <div className={`border rounded-xl p-4 mb-4 flex-grow ${result.outcome.includes('War') ? 'bg-red-900/20 border-red-500/30' : 'bg-blue-900/20 border-blue-500/30'}`}>
                        <h4 className={`font-bold text-xl mb-2 ${result.outcome.includes('War') ? 'text-red-400' : 'text-blue-400'}`}>{result.outcome}</h4>
                        <p className="text-sm text-white italic mb-3">"{result.response}"</p>
                        <div className="bg-black/40 p-2 rounded border border-white/5">
                            <p className="text-xs text-gray-400 uppercase font-bold">Consequence</p>
                            <p className="text-sm text-gray-300">{result.consequence}</p>
                        </div>
                    </div>
                    <button onClick={reset} className="w-full py-3 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold transition-all">
                        End Transmission
                    </button>
                </div>
            )}
        </div>
    );
};
const CodeGenesis = () => {
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [code, setCode] = useState(null);

    const generateCode = async (e) => {
        e.preventDefault();
        if (!input) return;
        setLoading(true);
        const systemPrompt = `You are an expert XRPL blockchain developer. 
        Generate a code snippet (XRPL Hook in C, or JS) based on the user's request. 
        JSON: { "language": "C/JS", "code": "The code snippet", "explanation": "Brief explanation" }`;
        const data = await callGemini(input, systemPrompt);
        setCode(data);
        setLoading(false);
    };

    return (
        <div className="bg-black/30 backdrop-blur-xl border border-orange-500/30 rounded-2xl p-6 md:p-8 w-full shadow-2xl shadow-orange-900/20 relative overflow-hidden flex flex-col h-full transition-transform hover:scale-[1.01]">
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-600/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>

            <div className="flex items-center gap-2 mb-4">
                <Code className="w-5 h-5 text-orange-400" />
                <h3 className="text-xl font-bold text-white">✨ X-Code Genesis</h3>
            </div>

            {!code ? (
                <div className="flex flex-col h-full">
                    <p className="text-gray-400 text-sm mb-4">For Solar Punk Builders: Describe a smart contract, game mechanic, or hook logic to generate a prototype.</p>
                    <form onSubmit={generateCode} className="mt-auto">
                        <textarea
                            value={input} onChange={(e) => setInput(e.target.value)}
                            className="w-full bg-black/50 border border-white/20 rounded-xl p-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all min-h-[100px] mb-4 text-sm font-mono"
                            placeholder="e.g. A hook that burns 1% of every transaction..."
                        />
                        <button type="submit" disabled={loading} className="w-full py-3 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-bold transition-all flex items-center justify-center gap-2">
                            {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Cpu className="w-4 h-4" />}
                            {loading ? 'Compiling...' : 'Generate Prototype'}
                        </button>
                    </form>
                </div>
            ) : (
                <div className="flex flex-col h-full animate-in fade-in">
                    <div className="bg-[#1e1e1e] rounded-xl p-4 mb-4 flex-grow overflow-hidden flex flex-col border border-white/10">
                        <div className="flex justify-between items-center mb-2 border-b border-white/10 pb-2">
                            <span className="text-xs text-orange-400 font-mono">{code.language}</span>
                            <button onClick={() => setCode(null)} className="text-gray-500 hover:text-white"><X className="w-4 h-4" /></button>
                        </div>
                        <pre className="flex-1 overflow-auto text-[10px] font-mono text-green-400 scrollbar-thin scrollbar-thumb-gray-700">
                            {code.code}
                        </pre>
                    </div>
                    <div className="bg-black/40 p-3 rounded-lg border border-orange-500/10 mb-4">
                        <p className="text-xs text-gray-300">{code.explanation}</p>
                    </div>
                    <button onClick={() => { setCode(null); setInput(""); }} className="w-full py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold text-sm">
                        New Project
                    </button>
                </div>
            )}
        </div>
    );
};

const ProposalArchitect = () => {
    const [idea, setIdea] = useState("");
    const [isDrafting, setIsDrafting] = useState(false);
    const [proposal, setProposal] = useState(null);

    const handleDraft = async (e) => {
        e.preventDefault();
        if (!idea) return;
        setIsDrafting(true);

        const systemPrompt = `You are a governance expert for the XMeta DAO. 
    Convert the user's rough idea into a structured DAO proposal.
    Return JSON: {
      "title": "Formal Proposal Title",
      "summary": "2 sentence executive summary",
      "rationale": "Why this is good for the project",
      "options": ["Yes", "No", "Abstain"]
    }`;

        const data = await callOpenAI(idea, systemPrompt);
        if (data) setProposal(data);
        else setProposal({
            title: "Proposal Generation Failed",
            summary: "Please try again.",
            rationale: "Network Error",
            options: []
        });
        setIsDrafting(false);
    };

    const handleSubmit = async () => {
        if (!proposal) return;

        try {
            const response = await fetch("https://formspree.io/f/mwpdepva", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    type: "DAO Proposal",
                    ...proposal
                })
            });

            if (response.ok) {
                alert("Proposal submitted to DAO Council!");
                setIdea("");
                setProposal(null);
            } else {
                alert("Failed to submit proposal. Please try again.");
            }
        } catch (error) {
            console.error("Submission error:", error);
            alert("Error submitting proposal.");
        }
    };

    return (
        <div className="bg-black/30 backdrop-blur-xl border border-yellow-500/30 rounded-2xl p-6 md:p-8 w-full shadow-2xl shadow-yellow-900/20 relative overflow-hidden flex flex-col h-full transition-transform hover:scale-[1.01]">
            <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-600/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>

            <div className="flex items-center gap-2 mb-4">
                <Vote className="w-5 h-5 text-yellow-400" />
                <h3 className="text-xl font-bold text-white">✨ Proposal Architect</h3>
            </div>
            <p className="text-gray-400 mb-6 text-sm">
                Draft governance proposals using AI. Ensure your voice is heard in the DAO.
            </p>

            {!proposal ? (
                <div className="mt-auto">
                    <form onSubmit={handleDraft} className="space-y-3">
                        <textarea
                            value={idea}
                            onChange={(e) => setIdea(e.target.value)}
                            placeholder="Describe your proposal (e.g. 'Allocate 5000 XMETA for a building contest')..."
                            className="w-full bg-black/50 border border-yellow-500/30 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-yellow-500 h-24 resize-none"
                        />
                        <button
                            type="submit"
                            disabled={isDrafting || !idea}
                            className="w-full py-3 rounded-lg bg-yellow-600 hover:bg-yellow-500 text-white font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isDrafting ? <Loader className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                            {isDrafting ? 'Drafting...' : 'Generate Proposal'}
                        </button>
                    </form>
                </div>
            ) : (
                <div className="mt-auto animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-xl p-5 relative max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-yellow-900 scrollbar-track-transparent">
                        <button
                            onClick={() => setProposal(null)}
                            className="absolute top-2 right-2 p-1 hover:bg-white/10 rounded-full transition-colors"
                        >
                            <X className="w-4 h-4 text-yellow-400" />
                        </button>
                        <h4 className="font-bold text-white mb-2">{proposal.title}</h4>
                        <p className="text-xs text-gray-300 mb-3">{proposal.summary}</p>
                        <div className="mb-3">
                            <span className="text-[10px] uppercase font-bold text-yellow-500 tracking-wider">Rationale</span>
                            <p className="text-xs text-gray-400 italic">"{proposal.rationale}"</p>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-4">
                            {proposal.options?.map((opt, i) => (
                                <span key={i} className="text-xs bg-white/10 px-2 py-1 rounded text-gray-300 border border-white/5">{opt}</span>
                            ))}
                        </div>
                        <button
                            onClick={handleSubmit}
                            className="w-full mt-4 py-2 bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-400 rounded-lg text-sm font-bold transition-colors border border-yellow-500/30"
                        >
                            Submit to Chain
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

const SignalDecoder = () => {
    const [decoding, setDecoding] = useState(false);
    const [message, setMessage] = useState(null);
    const [rawSignal] = useState("â™âŸ’... âƒâ€âŸ’... âŠ‘âŸ’â€âŸ’... âŸ’â‹”âŸ’â€â˜ŒâŸ’..."); // Simulated static signal

    const handleDecrypt = async () => {
        setDecoding(true);
        const systemPrompt = `You are a communications officer decoding a sci-fi signal from the XGalaxies universe.
        Return a JSON object:
        {
            "sender": "Faction or Entity Name",
            "message": "A short, mysterious lore message (max 20 words)",
            "security_level": "Low | Medium | Critical"
        }`;

        const data = await callGemini("Decrypt the signal.", systemPrompt);
        setMessage(data);
        setDecoding(false);
    };

    return (
        <div className="bg-black/30 backdrop-blur-xl border border-green-500/30 rounded-2xl p-6 md:p-8 w-full shadow-2xl shadow-green-900/20 relative overflow-hidden flex flex-col h-full transition-transform hover:scale-[1.01]">
            <div className="absolute top-0 right-0 w-64 h-64 bg-green-600/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>

            <div className="flex items-center gap-2 mb-4">
                <Radio className="w-5 h-5 text-green-400" />
                <h3 className="text-xl font-bold text-white">✨ Signal Intercept</h3>
            </div>
            <p className="text-gray-400 mb-6 text-sm">
                Deep space monitoring active. Decrypt incoming transmissions.
            </p>

            {!message ? (
                <div className="mt-auto">
                    <div className="bg-black/60 font-mono text-green-500 p-4 rounded-xl mb-4 text-xs tracking-widest break-all border border-green-500/20 animate-pulse">
                        {rawSignal}
                    </div>
                    <button
                        onClick={handleDecrypt}
                        disabled={decoding}
                        className="w-full py-3 rounded-lg bg-green-600 hover:bg-green-500 text-white font-bold transition-all flex items-center justify-center gap-2"
                    >
                        {decoding ? <Loader className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                        {decoding ? 'Decrypting...' : 'Decrypt Signal'}
                    </button>
                </div>
            ) : (
                <div className="mt-auto animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="bg-green-900/20 border border-green-500/30 rounded-xl p-5 relative">
                        <button
                            onClick={() => setMessage(null)}
                            className="absolute top-2 right-2 p-1 hover:bg-white/10 rounded-full transition-colors"
                        >
                            <X className="w-4 h-4 text-green-400" />
                        </button>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-green-400 uppercase tracking-wider">{message.sender}</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded border ${message.security_level === 'Critical' ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-green-500/20 text-green-400 border-green-500/30'
                                }`}>{message.security_level}</span>
                        </div>
                        <p className="font-mono text-green-100 text-sm leading-relaxed">
                            "{message.message}"
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

const FactionSorter = () => {
    const [input, setInput] = useState("");
    const [analyzing, setAnalyzing] = useState(false);
    const [faction, setFaction] = useState(null);

    const handleAnalyze = async (e) => {
        e.preventDefault();
        if (!input) return;
        setAnalyzing(true);

        const systemPrompt = `Analyze the user's playstyle description and assign them to a faction: 
        'Void Stalkers' (Stealth/Intel), 'Solar Punks' (Builders/Nature), or 'Neon Syndicate' (Traders/Cyber).
        Return JSON: {
            "faction": "Faction Name",
            "reason": "Short reason why",
            "welcome_msg": "A short welcome message from the faction leader."
        }`;

        const data = await callGemini(input, systemPrompt);
        setFaction(data);
        setAnalyzing(false);
    };

    return (
        <div className="bg-black/30 backdrop-blur-xl border border-pink-500/30 rounded-2xl p-6 md:p-8 w-full shadow-2xl shadow-pink-900/20 relative overflow-hidden flex flex-col h-full transition-transform hover:scale-[1.01]">
            <div className="absolute top-0 right-0 w-64 h-64 bg-pink-600/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>

            <div className="flex items-center gap-2 mb-4">
                <Fingerprint className="w-5 h-5 text-pink-400" />
                <h3 className="text-xl font-bold text-white">✨ Faction Allocator</h3>
            </div>
            <p className="text-gray-400 mb-6 text-sm flex-grow">
                The Sorting Algorithm. Tell us your playstyle to find your tribe.
            </p>

            {!faction ? (
                <form onSubmit={handleAnalyze} className="mt-auto">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="e.g. I like to explore ruins and stay hidden..."
                        className="w-full bg-black/50 border border-white/20 rounded-xl p-3 text-white placeholder-gray-500 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all min-h-[80px] mb-4 text-sm"
                    />
                    <button
                        type="submit"
                        disabled={analyzing}
                        className="w-full py-3 rounded-lg bg-pink-600 hover:bg-pink-500 text-white font-bold transition-all flex items-center justify-center gap-2"
                    >
                        {analyzing ? <Loader className="w-4 h-4 animate-spin" /> : <Users className="w-4 h-4" />}
                        {analyzing ? 'Scanning Soul...' : 'Find My Faction'}
                    </button>
                </form>
            ) : (
                <div className="mt-auto animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="bg-pink-900/20 border border-pink-500/30 rounded-xl p-5 relative">
                        <div className="text-center mb-4">
                            <span className="text-xs text-gray-400 uppercase tracking-widest block mb-1">Assigned Faction</span>
                            <h4 className="text-2xl font-black text-white italic uppercase tracking-tighter">{faction.faction}</h4>
                        </div>
                        <p className="text-pink-200 text-xs italic mb-3 text-center">"{faction.reason}"</p>
                        <div className="bg-black/40 p-3 rounded-lg border border-pink-500/10">
                            <p className="text-gray-300 text-sm">"{faction.welcome_msg}"</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const XDNAProfiler = () => {
    const [loading, setLoading] = useState(false);
    const [profile, setProfile] = useState(null);

    const analyzeDNA = async () => {
        setLoading(true);
        // Simulate a random wallet address or use a placeholder
        const simulatedWallet = "r" + Math.random().toString(36).substr(2, 30);

        const systemPrompt = `You are a geneticist for digital avatars. Analyze the 'wallet signature' provided and generate a unique genetic profile.
        JSON: { 
            "class": "Cyborg / Esper / Mutant / Pureblood",
            "origin": "A short origin story (max 15 words)",
            "hidden_talent": "Unique ability name",
            "power_level": "Number between 1-100"
        }`;

        const data = await callGemini(`Analyze DNA for wallet: ${simulatedWallet}`, systemPrompt);
        setProfile(data);
        setLoading(false);
    };

    return (
        <div className="bg-black/30 backdrop-blur-xl border border-blue-500/30 rounded-2xl p-6 md:p-8 w-full shadow-2xl shadow-blue-900/20 relative overflow-hidden flex flex-col h-full transition-transform hover:scale-[1.01]">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>

            <div className="flex items-center gap-2 mb-4">
                <Dna className="w-5 h-5 text-blue-400" />
                <h3 className="text-xl font-bold text-white">✨ X-DNA Profiler</h3>
            </div>
            <p className="text-gray-400 mb-6 text-sm flex-grow">
                Analyze your wallet's unique signature to reveal your avatar's hidden genetic traits.
            </p>

            {!profile ? (
                <div className="mt-auto">
                    <button
                        onClick={analyzeDNA}
                        disabled={loading}
                        className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Fingerprint className="w-4 h-4" />}
                        {loading ? 'Sequencing...' : 'Analyze Wallet DNA'}
                    </button>
                </div>
            ) : (
                <div className="mt-auto animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-5 relative">
                        <button
                            onClick={() => setProfile(null)}
                            className="absolute top-2 right-2 p-1 hover:bg-white/10 rounded-full transition-colors"
                        >
                            <X className="w-4 h-4 text-blue-400" />
                        </button>
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Class: {profile.class}</span>
                            <div className="flex items-center gap-1">
                                <Zap className="w-3 h-3 text-yellow-400" />
                                <span className="text-xs font-mono text-white">{profile.power_level} PL</span>
                            </div>
                        </div>
                        <h4 className="font-bold text-white mb-1">{profile.hidden_talent}</h4>
                        <p className="text-xs text-blue-200 italic">"{profile.origin}"</p>
                    </div>
                </div>
            )}
        </div>
    );
};

const DailyNode = () => {
    const [loading, setLoading] = useState(false);
    const [news, setNews] = useState(null);

    useEffect(() => {
        fetchNews();
    }, []);

    const fetchNews = async () => {
        setLoading(true);
        const systemPrompt = `You are a news editor for "The Daily Node", the main newspaper of the XMeta metaverse.
        Generate 3 short, punchy headlines about fictional events (market crashes, faction wars, discoveries) in the metaverse.
        JSON: { "headlines": ["Headline 1", "Headline 2", "Headline 3"] }`;

        const data = await callOpenAI("Get latest news.", systemPrompt);
        if (data) {
            setNews(data);
        } else {
            setNews({
                headlines: [
                    "XMeta Core Stabilized: Trustlines Exceed 19,000",
                    "Void Stalkers Report Anomalies in Sector 7",
                    "Solar Punks Propose New Terraforming Bill"
                ]
            });
        }
        setLoading(false);
    };

    return (
        <div className="bg-black/30 backdrop-blur-xl border border-gray-500/30 rounded-2xl p-6 md:p-8 w-full shadow-2xl shadow-gray-900/20 relative overflow-hidden flex flex-col h-full transition-transform hover:scale-[1.01]">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gray-600/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>

            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Newspaper className="w-5 h-5 text-gray-400" />
                    <h3 className="text-xl font-bold text-white">✨ The Daily Node</h3>
                </div>
                <button onClick={fetchNews} disabled={loading} className="p-1 hover:bg-white/10 rounded-full text-gray-400 transition-colors">
                    <Loader className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            <div className="flex-grow space-y-3">
                {loading || !news ? (
                    [1, 2, 3].map(i => (
                        <div key={i} className="h-10 bg-white/5 rounded animate-pulse w-full"></div>
                    ))
                ) : (
                    news.headlines.map((headline, i) => (
                        <div key={i} className="p-3 bg-white/5 border border-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer group">
                            <p className="text-sm text-gray-300 group-hover:text-white font-medium flex items-start gap-2">
                                <span className="text-cyan-500 font-bold">0{i + 1}.</span>
                                {headline}
                            </p>
                        </div>
                    ))
                )}
            </div>
            <p className="text-xs text-gray-500 mt-4 text-center">Live feed from XMeta City Core.</p>
        </div>
    );
};

const XAIAssistant = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'ai', text: 'Greetings, Pioneer. I am X-AI, the XGalaxies onboard nav-computer. How can I assist you today?' }
    ]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = { role: 'user', text: input };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setIsTyping(true);

        const systemPrompt = "You are X-AI, an intelligent, slightly robotic but helpful AI assistant for the XMeta XGalaxies metaverse on XRPL. Answer questions about the game, crypto, or space exploration concisely.";
        const responseText = await callOpenAIText(input, systemPrompt);

        setMessages(prev => [...prev, { role: 'ai', text: responseText }]);
        setIsTyping(false);
    };

    return (
        <div className="fixed bottom-6 right-6 z-[60] flex flex-col items-end">
            {/* Chat Window */}
            {isOpen && (
                <div className="mb-4 w-80 md:w-96 bg-black/90 backdrop-blur-xl border border-cyan-500/30 rounded-2xl shadow-2xl shadow-cyan-500/20 overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
                    <div className="bg-cyan-900/30 p-4 border-b border-white/10 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <Cpu className="w-5 h-5 text-cyan-400" />
                            <span className="font-bold text-white">X-AI Nav Systems</span>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <div ref={scrollRef} className="h-80 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-cyan-900 scrollbar-track-transparent">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.role === 'user'
                                    ? 'bg-cyan-600 text-white rounded-tr-none'
                                    : 'bg-gray-800 text-gray-200 rounded-tl-none border border-white/10'
                                    }`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="bg-gray-800 p-3 rounded-2xl rounded-tl-none border border-white/10 flex gap-1">
                                    <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"></span>
                                    <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce delay-100"></span>
                                    <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce delay-200"></span>
                                </div>
                            </div>
                        )}
                    </div>

                    <form onSubmit={handleSend} className="p-3 border-t border-white/10 bg-black/50 flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask navigation..."
                            className="flex-1 bg-gray-900 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
                        />
                        <button type="submit" className="bg-cyan-600 hover:bg-cyan-500 p-2 rounded-lg text-white transition-colors">
                            <Send className="w-4 h-4" />
                        </button>
                    </form>
                </div>
            )}

            {/* Floating Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-14 h-14 bg-cyan-600 hover:bg-cyan-500 rounded-full flex items-center justify-center shadow-lg shadow-cyan-500/40 text-white transition-all hover:scale-110 group"
            >
                {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
                {/* Ping animation when closed */}
                {!isOpen && (
                    <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full animate-ping"></span>
                )}
            </button>
        </div>
    );
};

// Simple Icon wrapper to avoid redefining lucide icons if not imported
const TargetIcon = (props) => (
    <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" />
    </svg>
)

const SynthwaveMusicPlayer = () => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(0.5);
    const audioRef = useRef(null);

    // Using a reliable synthwave stream or file
    const STREAM_URL = "https://stream.nightride.fm/nightride.m4a";

    const togglePlay = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleVolumeChange = (e) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        if (audioRef.current) {
            audioRef.current.volume = newVolume;
        }
    };

    return (
        <div className="fixed bottom-6 left-6 z-50">
            <audio ref={audioRef} src={STREAM_URL} loop />

            <div className={`flex items-center gap-3 bg-black/80 backdrop-blur-md border border-pink-500/30 p-3 rounded-full shadow-[0_0_15px_rgba(236,72,153,0.3)] transition-all duration-300 ${isPlaying ? 'w-64' : 'w-12 h-12 justify-center'}`}>
                <button
                    onClick={togglePlay}
                    className="w-8 h-8 flex items-center justify-center bg-pink-600 hover:bg-pink-500 rounded-full text-white shadow-lg shadow-pink-600/40 transition-transform hover:scale-105"
                >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                </button>

                {isPlaying && (
                    <div className="flex items-center gap-3 flex-1 animate-in fade-in slide-in-from-left-2 duration-300">
                        <div className="flex flex-col">
                            <span className="text-[10px] text-pink-400 font-bold uppercase tracking-wider">Nightride FM</span>
                            <span className="text-xs text-white font-mono truncate w-24">Synthwave Radio</span>
                        </div>

                        <div className="flex items-center gap-2 flex-1">
                            <Volume2 className="w-3 h-3 text-gray-400" />
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={volume}
                                onChange={handleVolumeChange}
                                className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-pink-500 [&::-webkit-slider-thumb]:rounded-full"
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const TokenDashboard = ({ address, balance }) => {
    return (
        <div className="bg-gradient-to-b from-slate-900/80 to-black/80 backdrop-blur-sm border-y border-white/10 py-12">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-white mb-2">Command Center</h2>
                        <p className="text-gray-400">Welcome back, Commander.</p>
                    </div>
                    <div className="text-right">
                        <div className="text-sm text-gray-500 mb-1">Connected Wallet</div>
                        <div className="font-mono text-cyan-400 bg-cyan-950/30 px-3 py-1 rounded border border-cyan-900">{address}</div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Balance Card */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:border-pink-500/50 transition-colors">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Rocket className="w-24 h-24" />
                        </div>
                        <div className="text-gray-400 text-sm mb-1">XMETA Balance</div>
                        <div className="text-4xl font-bold text-white mb-4">{balance}</div>
                        <div className="flex gap-2">
                            <button className="flex-1 bg-pink-600 hover:bg-pink-500 py-2 rounded text-sm font-bold text-white transition-colors">Stake</button>
                            <button className="flex-1 bg-white/10 hover:bg-white/20 py-2 rounded text-sm font-bold text-white transition-colors">Trade</button>
                        </div>
                    </div>

                    {/* Trustline Status */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:border-green-500/50 transition-colors">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <ShieldCheck className="w-24 h-24" />
                        </div>
                        <div className="text-gray-400 text-sm mb-1">Trustline Status</div>
                        <div className="text-2xl font-bold text-green-400 mb-2 flex items-center gap-2">
                            <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                            Active
                        </div>
                        <p className="text-xs text-gray-500 mb-4 break-all font-mono">{XRPL_ISSUER}</p>
                        <a href={TRUSTLINE_URL} target="_blank" rel="noreferrer" className="block text-center w-full bg-white/10 hover:bg-white/20 py-2 rounded text-sm font-bold text-white transition-colors">
                            Verify on Ledger
                        </a>
                    </div>

                    {/* DAO Power */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:border-yellow-500/50 transition-colors">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Users className="w-24 h-24" />
                        </div>
                        <div className="text-gray-400 text-sm mb-1">Voting Power</div>
                        <div className="text-4xl font-bold text-white mb-4">Level 3</div>
                        <div className="w-full bg-gray-700 h-2 rounded-full mb-2">
                            <div className="bg-yellow-500 h-2 rounded-full w-3/4"></div>
                        </div>
                        <p className="text-xs text-gray-400">Next proposal unlocks in 2 days</p>
                    </div>
                </div>
            </div>
        </div>

    );
};

export default function App() {
    const [isConnected, setIsConnected] = useState(false);
    const [account, setAccount] = useState(null);
    const [showWalletModal, setShowWalletModal] = useState(false);
    const [balance, setBalance] = useState(localStorage.getItem('xmeta_balance') || '0');

    useEffect(() => {
        const checkConnection = async () => {
            const xumm = getXummInstance();
            if (xumm && xumm.user) {
                const state = await xumm.user.account;
                if (state) {
                    setAccount(state);
                    setIsConnected(true);
                    checkBalance(state);
                }
            }
        };
        checkConnection();
    }, []);

    const handleConnect = async () => {
        if (isConnected) {
            await logoutWallet();
            setIsConnected(false);
            setAccount(null);
            setBalance('0');
            localStorage.removeItem('xmeta_balance');
            return;
        }
        const user = await connectWallet();
        if (user) {
            setAccount(user.me.account);
            setIsConnected(true);
            setShowWalletModal(false);
            checkBalance(user.me.account);
        }
    };

    const confirmConnect = () => {
        handleConnect();
    };

    const handleTrustline = async () => {
        if (!account) return;
        const xumm = getXummInstance();
        try {
            const payload = {
                TransactionType: 'TrustSet',
                Account: account,
                LimitAmount: {
                    currency: TOKEN_HEX,
                    issuer: ISSUER_ADDRESS,
                    value: '1000000000'
                }
            };
            console.log("Creating trustline payload via Netlify Function...", payload);
            const endpoint = '/.netlify/functions/create-payload';

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Xumm API Error: ${response.status} ${errorText}`);
            }

            const result = await response.json();
            if (result?.next?.always) {
                window.open(result.next.always, '_blank');
            }
        } catch (e) {
            console.error("Trustline Error:", e);
        }
    };

    const checkBalance = async (userAccount) => {
        if (!userAccount) return;
        try {
            const client = new Client('wss://xrplcluster.com');
            await client.connect();
            const response = await client.request({
                command: 'account_lines',
                account: userAccount,
                peer: ISSUER_ADDRESS
            });
            const line = response.result.lines.find(l => l.currency === TOKEN_HEX || l.currency === TOKEN_NAME);
            if (line) {
                setBalance(line.balance);
                localStorage.setItem('xmeta_balance', line.balance);
            }
            await client.disconnect();
        } catch (e) {
            console.error("Balance Check Error:", e);
        }
    };

    return (
        <div className="min-h-screen bg-[#020617] text-white font-sans selection:bg-pink-500 selection:text-white overflow-x-hidden">
            <TronGridBackground />
            <XAIAssistant />
            <SynthwaveMusicPlayer />
            <Header isConnected={isConnected} onConnect={handleConnect} />

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center">
                {/* Adjusted blurred blobs to match new color scheme */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] -z-10 pointer-events-none" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-cyan-600/10 rounded-full blur-[100px] -z-10 pointer-events-none mix-blend-screen" />

                <TrustlineCounter />

                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 animate-in slide-in-from-bottom-5 duration-700">
                    <span className="block text-white drop-shadow-lg">The Metaverse</span>
                    <span className="block bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 pb-2">
                        Returned to the People
                    </span>
                </h1>

                <p className="mt-4 max-w-2xl text-xl text-gray-300 mx-auto mb-10 animate-in slide-in-from-bottom-5 duration-700 delay-100">
                    XMeta XGalaxies is back. A community takeover reviving the abandoned vision on the XRP Ledger. Decentralized. DAO-Governed. Built by You.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto animate-in slide-in-from-bottom-5 duration-700 delay-200">
                    <a href="#game-center" className="px-8 py-4 rounded-full bg-white text-black font-bold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
                        <Rocket className="w-5 h-5" /> Launch App
                    </a>
                    <a href="https://xpmarket.com" target="_blank" rel="noreferrer" className="px-8 py-4 rounded-full bg-white/10 text-white font-bold hover:bg-white/20 transition-colors backdrop-blur-md border border-white/10 flex items-center justify-center gap-2">
                        <Zap className="w-5 h-5" /> Trade on XPMarket
                    </a>
                </div>
            </section>

            {/* Token Dashboard (Conditional) */}
            {isConnected && <TokenDashboard address={account} balance={balance} />}

            {/* The Story / Resurrection */}
            <section id="vision" className="py-24 bg-black/40 backdrop-blur-sm relative overflow-hidden border-t border-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold mb-6 flex items-center gap-3">
                                <span className="p-2 bg-pink-500/20 rounded-lg"><Zap className="text-pink-500" /></span>
                                The Awakening
                            </h2>
                            <div className="space-y-6 text-gray-300 text-lg leading-relaxed">
                                <p>
                                    In 2021, XGalaxies promised a universe. 19,000+ pioneers set trustlines, ready to explore. Then... silence. For three years, the metaverse slept.
                                </p>
                                <p>
                                    But the signal never died. In 2025, the community reclaimed the controls. We are no longer waiting for developers—<span className="text-white font-bold">we are the developers</span>.
                                </p>
                                <p>
                                    This is a transparent, DAO-led resurrection. No secret roadmaps. No gaslighting. Just pure, open-source building on the speed of XRPL.
                                </p>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl transform rotate-3 blur-md opacity-20"></div>
                            <div className="relative bg-[#0b0f19] border border-white/10 rounded-2xl p-8 shadow-2xl">
                                <h3 className="text-xl font-bold text-white mb-4">Status Report</h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center pb-4 border-b border-white/10">
                                        <span className="text-gray-400">Project Status</span>
                                        <span className="text-green-400 font-bold px-2 py-1 bg-green-400/10 rounded border border-green-500/20">Active Dev</span>
                                    </div>
                                    <div className="flex justify-between items-center pb-4 border-b border-white/10">
                                        <span className="text-gray-400">Trustlines</span>
                                        <span className="text-white font-mono">19,042</span>
                                    </div>
                                    <div className="flex justify-between items-center pb-4 border-b border-white/10">
                                        <span className="text-gray-400">Governance</span>
                                        <span className="text-white">DAO V1</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400">Network</span>
                                        <span className="text-blue-400 font-bold flex items-center gap-1">
                                            <img src="https://cryptologos.cc/logos/xrp-xrp-logo.png?v=024" alt="XRP" className="w-5 h-5 grayscale-0" />
                                            XRPL
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4 Pillars Grid */}
            <section id="ecosystem" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-4">Build Your Legacy</h2>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        The new XGalaxies isn't just about watching—it's about owning.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {FEATURES.map((feature, idx) => (
                        <div key={idx} className="bg-white/5 border border-white/10 p-6 rounded-2xl hover:bg-white/10 hover:-translate-y-1 transition-all duration-300 group">
                            <div className="w-12 h-12 bg-gradient-to-br from-slate-800 to-black rounded-lg flex items-center justify-center mb-4 text-cyan-400 border border-white/5 shadow-lg group-hover:scale-110 transition-transform">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-bold mb-2 group-hover:text-cyan-300 transition-colors">{feature.title}</h3>
                            <p className="text-gray-400 text-sm">{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* GAME CENTER */}
            <GameDashboard address={isConnected ? "r3XwJ1hr1PtbRvbhuUkybV6tmYzzA11WcB" : "Not Connected"} />

            {/* AI DECK SECTION */}
            <section id="ai-deck" className="py-24 bg-gradient-to-b from-[#020617] to-indigo-950/20 border-y border-white/5">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-10">
                        <span className="text-cyan-400 font-bold tracking-wider text-sm uppercase mb-2 block flex items-center justify-center gap-2">
                            <Sparkles className="w-4 h-4" /> Powered by Gemini API
                        </span>
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">The AI Command Deck</h2>
                        <p className="text-gray-300 max-w-2xl mx-auto">
                            Directly interface with the metaverse core. Generate assets, get mission briefings, and shape the lore using our new Gemini integration.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {/* Left: World Builder */}
                        <div className="min-h-[400px]">
                            <AIGenerator />
                        </div>
                        {/* Center: Mission Generator */}
                        <div className="min-h-[400px]">
                            <MissionGenerator />
                        </div>
                        {/* Right: Proposal Architect */}
                        <div className="min-h-[400px]" id="governance">
                            <ProposalArchitect />
                        </div>
                    </div>
                </div>
            </section>

            {/* CREATOR & COMMUNITY */}
            <section id="creator" className="py-24 bg-black/20 border-t border-white/5">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-10">
                        <span className="text-orange-400 font-bold tracking-wider text-sm uppercase mb-2 block flex items-center justify-center gap-2">
                            <Users className="w-4 h-4" /> Community Hub
                        </span>
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Creators & Diplomats</h2>
                        <p className="text-gray-300 max-w-2xl mx-auto">
                            Tools for builders to generate code and diplomats to engage in first contact scenarios.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        {/* Left: Alien Diplomat */}
                        <div className="min-h-[450px]">
                            <AlienDiplomat />
                        </div>
                        {/* Right: X-Code Genesis */}
                        <div className="min-h-[450px]">
                            <CodeGenesis />
                        </div>
                    </div>
                </div>
            </section>

            {/* IDENTITY & COMMS SECTION */}
            <section id="comms" className="py-24 bg-gradient-to-t from-[#020617] to-indigo-950/20 border-b border-white/5">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-10">
                        <span className="text-green-400 font-bold tracking-wider text-sm uppercase mb-2 block flex items-center justify-center gap-2">
                            <Radio className="w-4 h-4" /> Secure Channels Active
                        </span>
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Identity & Communications</h2>
                        <p className="text-gray-300 max-w-2xl mx-auto">
                            Decrypt deep space signals for hidden lore or let the AI analyze your playstyle to find your true faction.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
                        {/* Left: Signal Decoder */}
                        <div className="min-h-[350px]">
                            <SignalDecoder />
                        </div>
                        {/* Center-Left: Faction Sorter */}
                        <div className="min-h-[350px]">
                            <FactionSorter />
                        </div>
                        {/* Center-Right: X-DNA Profiler (NEW) */}
                        <div className="min-h-[350px]">
                            <XDNAProfiler />
                        </div>
                        {/* Right: Daily Node (NEW) */}
                        <div className="min-h-[350px]">
                            <DailyNode />
                        </div>
                    </div>
                </div>
            </section>

            {/* NFT Showcase */}
            <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-end mb-12">
                    <div>
                        <h2 className="text-3xl font-bold mb-2">Marketplace Preview</h2>
                        <p className="text-gray-400">Assets returning in the 2025 drop.</p>
                    </div>
                    <a href="https://xpmarket.com" target="_blank" rel="noreferrer" className="hidden sm:flex text-pink-500 hover:text-pink-400 items-center gap-1 font-bold">
                        View All Collections <ChevronRight className="w-4 h-4" />
                    </a>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {NFTS.map((nft, idx) => (
                        <div key={idx} className="group bg-[#0f121a] border border-white/10 rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-pink-500/10 transition-all hover:border-pink-500/30">
                            <div className={`h-48 bg-gradient-to-br ${nft.color} relative overflow-hidden`}>
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                                {/* Simulated Image Placeholder */}
                                <div className="absolute inset-0 flex items-center justify-center opacity-50 font-bold text-4xl text-white mix-blend-overlay">
                                    {nft.type}
                                </div>
                            </div>
                            <div className="p-5">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-lg text-white">{nft.name}</h3>
                                    <span className="text-xs font-bold px-2 py-1 bg-white/10 rounded uppercase text-gray-300">{nft.rarity}</span>
                                </div>
                                <div className="flex justify-between items-center mt-4">
                                    <span className="text-gray-500 text-sm">Floor Price</span>
                                    <span className="text-cyan-400 font-bold">1,500 XMETA</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Roadmap */}
            <section id="roadmap" className="py-24 bg-black/60 relative">
                <div className="max-w-4xl mx-auto px-4">
                    <h2 className="text-4xl font-bold text-center mb-16">The Flight Path</h2>

                    <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/20 before:to-transparent">
                        {ROADMAP_STEPS.map((step, idx) => (
                            <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">

                                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-black bg-gray-800 group-hover:bg-pink-500 transition-colors shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                                    {step.status === 'current' ? <div className="w-3 h-3 bg-pink-500 rounded-full animate-ping" /> : <div className="w-2 h-2 bg-gray-500 rounded-full" />}
                                </div>

                                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-bold text-pink-500">{step.phase}</span>
                                        {step.status === 'current' && <span className="text-xs bg-pink-500/20 text-pink-300 px-2 py-1 rounded">IN PROGRESS</span>}
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                                    <p className="text-gray-400 text-sm">{step.desc}</p>
                                </div>

                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            {/* Footer */}
            <footer className="py-12 border-t border-white/10 bg-black text-center relative z-10">
                <div className="max-w-7xl mx-auto px-4 flex flex-col items-center">
                    <div className="flex items-center gap-2 mb-4 opacity-50 hover:opacity-100 transition-opacity">
                        <Rocket className="w-6 h-6 text-pink-500" />
                        <span className="font-bold text-xl tracking-widest text-white">XMETA</span>
                    </div>
                    <div className="flex gap-6 text-gray-400 text-sm mb-8">
                        <a href="#" className="hover:text-pink-400 transition-colors">Manifesto</a>
                        <a href="#" className="hover:text-cyan-400 transition-colors">Contract</a>
                        <a href="#" className="hover:text-purple-400 transition-colors">Ledger</a>
                        <a href="#" className="hover:text-green-400 transition-colors">DAO</a>
                    </div>
                    <p className="text-gray-600 text-xs">
                        © 2025 XMeta XGalaxies DAO. Built on the XRP Ledger.
                    </p>
                </div>
            </footer>

            {/* Wallet Modal */}
            {showWalletModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-[#0f121a] border border-white/10 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
                        <button
                            onClick={() => setShowWalletModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <h3 className="text-2xl font-bold mb-2 text-white">Connect Wallet</h3>
                        <p className="text-gray-400 mb-6 text-sm">Scan with Xaman (formerly Xumm) to sign in securely.</p>

                        <div className="bg-white p-4 rounded-xl mb-6 flex items-center justify-center">
                            {/* Simulated QR Code */}
                            <div className="w-48 h-48 bg-gray-200 flex items-center justify-center rounded border-2 border-dashed border-gray-400">
                                <span className="text-gray-500 font-mono text-xs">QR CODE SIMULATION</span>
                            </div>
                        </div>

                        <button
                            onClick={confirmConnect}
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-blue-500/20"
                        >
                            Simulate Scan & Sign
                        </button>
                        <p className="text-center mt-4 text-xs text-gray-500">
                            By connecting, you agree to the DAO Terms of Service.
                        </p>
                    </div>
                </div>
            )}
        </div>

    );
}
