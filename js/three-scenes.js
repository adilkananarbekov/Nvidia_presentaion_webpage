/* ==================== THREE.JS 3D SCENES — Phase 3 ==================== */
(function () {
    'use strict';

    const NVIDIA_GREEN = 0x76B900;
    const NVIDIA_GREEN_BRIGHT = 0x8fd400;
    const INTEL_BLUE = 0x0071C5;

    window.NVScenes = window.NVScenes || {};

    /* ========== UTILITY ========== */
    function createRenderer(canvas, opts) {
        opts = opts || {};
        var renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            antialias: true,
            alpha: true
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.outputEncoding = THREE.sRGBEncoding;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = opts.exposure || 1.0;
        return renderer;
    }

    function fitRenderer(renderer, canvas) {
        var parent = canvas.parentElement;
        var w = parent.clientWidth;
        var h = parent.clientHeight;
        renderer.setSize(w, h, false);
        return { w: w, h: h };
    }

    /* ========== SCENE: GPU MODEL (Section 2) ========== */
    function initGPUScene() {
        var canvas = document.getElementById('gpu-canvas');
        if (!canvas) return;

        var scene = new THREE.Scene();
        var camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
        camera.position.set(0, 0.5, 3);

        var renderer = createRenderer(canvas);
        var dims = fitRenderer(renderer, canvas);
        camera.aspect = dims.w / dims.h;
        camera.updateProjectionMatrix();

        scene.add(new THREE.AmbientLight(0xffffff, 0.4));

        var mainLight = new THREE.DirectionalLight(0xffffff, 1.0);
        mainLight.position.set(5, 5, 5);
        scene.add(mainLight);

        var greenLight = new THREE.PointLight(NVIDIA_GREEN, 2, 10);
        greenLight.position.set(-2, 1, 3);
        scene.add(greenLight);

        var rimLight = new THREE.PointLight(NVIDIA_GREEN_BRIGHT, 1, 8);
        rimLight.position.set(0, 3, -3);
        scene.add(rimLight);

        var gpuModel = null;
        var loader = new THREE.GLTFLoader();

        // Loading placeholder
        var loadGeom = new THREE.IcosahedronGeometry(0.3, 1);
        var loadMat = new THREE.MeshBasicMaterial({ color: NVIDIA_GREEN, wireframe: true });
        var loadMesh = new THREE.Mesh(loadGeom, loadMat);
        scene.add(loadMesh);

        loader.load(
            'assets/nvidia_geforce_rtx_3090.glb',
            function (gltf) {
                scene.remove(loadMesh);
                gpuModel = gltf.scene;
                var box = new THREE.Box3().setFromObject(gpuModel);
                var size = box.getSize(new THREE.Vector3());
                var center = box.getCenter(new THREE.Vector3());
                var maxDim = Math.max(size.x, size.y, size.z);
                var scale = 2 / maxDim;
                gpuModel.scale.setScalar(scale);
                gpuModel.position.sub(center.multiplyScalar(scale));
                scene.add(gpuModel);
                if (window.NVScenes.onGPULoaded) window.NVScenes.onGPULoaded();
            },
            function (progress) {
                var pct = progress.total > 0 ? (progress.loaded / progress.total) : 0;
                if (window.NVScenes.onGPUProgress) window.NVScenes.onGPUProgress(pct);
            },
            function () {
                scene.remove(loadMesh);
                var fallback = createProceduralGPU();
                scene.add(fallback);
                gpuModel = fallback;
            }
        );

        var isActive = false;
        var clock = new THREE.Clock();

        function animate() {
            if (!isActive) { requestAnimationFrame(animate); return; }
            var t = clock.getElapsedTime();
            if (gpuModel) {
                gpuModel.rotation.y = t * 0.25;
                gpuModel.position.y = Math.sin(t * 0.4) * 0.03;
            } else {
                loadMesh.rotation.y = t * 2;
            }
            greenLight.intensity = 2 + Math.sin(t * 1.5) * 0.4;
            renderer.render(scene, camera);
            requestAnimationFrame(animate);
        }

        new IntersectionObserver(function (entries) {
            isActive = entries[0].isIntersecting;
        }, { threshold: 0.1 }).observe(canvas);

        window.addEventListener('resize', function () {
            var d = fitRenderer(renderer, canvas);
            camera.aspect = d.w / d.h;
            camera.updateProjectionMatrix();
        });

        animate();
    }

    function createProceduralGPU() {
        var group = new THREE.Group();
        var pcb = new THREE.Mesh(
            new THREE.BoxGeometry(2, 0.05, 1.2),
            new THREE.MeshStandardMaterial({ color: 0x1a3300, roughness: 0.5, metalness: 0.8 })
        );
        group.add(pcb);

        var die = new THREE.Mesh(
            new THREE.BoxGeometry(0.6, 0.08, 0.6),
            new THREE.MeshStandardMaterial({ color: NVIDIA_GREEN, emissive: NVIDIA_GREEN, emissiveIntensity: 0.3, roughness: 0.2, metalness: 0.9 })
        );
        die.position.y = 0.065;
        group.add(die);

        for (var i = 0; i < 12; i++) {
            var fin = new THREE.Mesh(
                new THREE.BoxGeometry(1.6, 0.3, 0.02),
                new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.3, metalness: 0.9 })
            );
            fin.position.set(0, 0.25, -0.5 + i * (1.0 / 11));
            group.add(fin);
        }
        return group;
    }

    /* ========== SCENE: CHIP MERGE (Section 5) ========== */
    function initChipScene() {
        var canvas = document.getElementById('chip-canvas');
        if (!canvas) return;

        var scene = new THREE.Scene();
        var camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
        camera.position.set(0, 2, 5);
        camera.lookAt(0, 0, 0);

        var renderer = createRenderer(canvas);
        var dims = fitRenderer(renderer, canvas);
        camera.aspect = dims.w / dims.h;
        camera.updateProjectionMatrix();

        scene.add(new THREE.AmbientLight(0xffffff, 0.3));
        var dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
        dirLight.position.set(3, 5, 3);
        scene.add(dirLight);

        // CPU chip (neutral/white)
        var cpu = new THREE.Mesh(
            new THREE.BoxGeometry(1, 0.2, 1),
            new THREE.MeshStandardMaterial({ color: 0x4488cc, emissive: 0x224466, emissiveIntensity: 0.2, roughness: 0.3, metalness: 0.8 })
        );
        cpu.position.x = -2;
        scene.add(cpu);

        var cpuLines = createCircuitLines(0x4488cc, -2, 0.15);
        scene.add(cpuLines);

        // GPU chip (green)
        var gpu = new THREE.Mesh(
            new THREE.BoxGeometry(1.2, 0.25, 1.2),
            new THREE.MeshStandardMaterial({ color: NVIDIA_GREEN, emissive: NVIDIA_GREEN, emissiveIntensity: 0.3, roughness: 0.3, metalness: 0.8 })
        );
        gpu.position.x = 2;
        scene.add(gpu);

        var gpuLines = createCircuitLines(NVIDIA_GREEN, 2, 0.17);
        scene.add(gpuLines);

        var mergeGlow = new THREE.PointLight(0xffffff, 0, 5);
        mergeGlow.position.set(0, 0.5, 0);
        scene.add(mergeGlow);

        var mergeProgress = 0;
        var isActive = false;
        var clock = new THREE.Clock();

        window.NVScenes.chipMerge = {
            setProgress: function (p) { mergeProgress = Math.max(0, Math.min(1, p)); }
        };

        function animate() {
            if (!isActive) { requestAnimationFrame(animate); return; }
            var t = clock.getElapsedTime();
            cpu.position.x = -2 + mergeProgress * 2;
            gpu.position.x = 2 - mergeProgress * 2;
            cpuLines.position.x = -2 + mergeProgress * 2;
            gpuLines.position.x = 2 - mergeProgress * 2;
            cpu.rotation.y = t * 0.3;
            gpu.rotation.y = -t * 0.3;
            mergeGlow.intensity = mergeProgress * 3;
            cpu.position.y = Math.sin(t * 0.8) * 0.08;
            gpu.position.y = Math.sin(t * 0.8 + Math.PI) * 0.08;
            renderer.render(scene, camera);
            requestAnimationFrame(animate);
        }

        new IntersectionObserver(function (entries) {
            isActive = entries[0].isIntersecting;
        }, { threshold: 0.1 }).observe(canvas);

        window.addEventListener('resize', function () {
            var d = fitRenderer(renderer, canvas);
            camera.aspect = d.w / d.h;
            camera.updateProjectionMatrix();
        });

        animate();
    }

    function createCircuitLines(color, xOffset, yOffset) {
        var group = new THREE.Group();
        var mat = new THREE.LineBasicMaterial({ color: color, transparent: true, opacity: 0.4 });
        for (var i = 0; i < 6; i++) {
            var startZ = -0.4 + (i / 5) * 0.8;
            var points = [
                new THREE.Vector3(-0.5, yOffset, startZ),
                new THREE.Vector3(-0.2, yOffset, startZ),
                new THREE.Vector3(0, yOffset, startZ + (Math.random() - 0.5) * 0.15),
                new THREE.Vector3(0.2, yOffset, startZ),
                new THREE.Vector3(0.5, yOffset, startZ)
            ];
            group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), mat));
        }
        return group;
    }

    /* ========== SCENE: SPHERE FALLBACK (Section 4 — only if image fails) ========== */
    function initSphereScene() {
        var canvas = document.getElementById('sphere-canvas');
        if (!canvas) return;

        var scene = new THREE.Scene();
        var camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
        camera.position.set(0, 0, 5);

        var renderer = createRenderer(canvas);
        var dims = fitRenderer(renderer, canvas);
        camera.aspect = dims.w / dims.h;
        camera.updateProjectionMatrix();

        scene.add(new THREE.AmbientLight(0xffffff, 0.2));
        scene.add(new THREE.PointLight(NVIDIA_GREEN, 2, 15).position.set(3, 2, 3) && new THREE.PointLight(NVIDIA_GREEN, 2, 15));

        var sphere = new THREE.Mesh(
            new THREE.SphereGeometry(1.5, 64, 64),
            new THREE.MeshStandardMaterial({ color: 0x111111, emissive: NVIDIA_GREEN, emissiveIntensity: 0.15, roughness: 0.4, metalness: 0.6 })
        );
        scene.add(sphere);

        var wireframe = new THREE.Mesh(
            new THREE.SphereGeometry(1.52, 32, 32),
            new THREE.MeshBasicMaterial({ color: NVIDIA_GREEN, wireframe: true, transparent: true, opacity: 0.15 })
        );
        scene.add(wireframe);

        var ring = new THREE.Mesh(
            new THREE.TorusGeometry(2.2, 0.01, 8, 100),
            new THREE.MeshBasicMaterial({ color: NVIDIA_GREEN, transparent: true, opacity: 0.3 })
        );
        ring.rotation.x = Math.PI / 2.5;
        scene.add(ring);

        var greenPt = new THREE.PointLight(NVIDIA_GREEN, 2, 15);
        greenPt.position.set(3, 2, 3);
        scene.add(greenPt);

        var isActive = false;
        var clock = new THREE.Clock();

        function animate() {
            if (!isActive) { requestAnimationFrame(animate); return; }
            var t = clock.getElapsedTime();
            sphere.rotation.y = t * 0.2;
            wireframe.rotation.y = -t * 0.15;
            ring.rotation.z = t * 0.1;
            renderer.render(scene, camera);
            requestAnimationFrame(animate);
        }

        new IntersectionObserver(function (entries) {
            isActive = entries[0].isIntersecting;
        }, { threshold: 0.1 }).observe(canvas);

        window.addEventListener('resize', function () {
            var d = fitRenderer(renderer, canvas);
            camera.aspect = d.w / d.h;
            camera.updateProjectionMatrix();
        });

        animate();
    }

    /* ========== SCENE: SERVER RACK (Section 6 — BRIGHT) ========== */
    function initServerScene() {
        var canvas = document.getElementById('server-canvas');
        if (!canvas) return;

        var scene = new THREE.Scene();
        var camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
        camera.position.set(0, 2, 8);
        camera.lookAt(0, 1, 0);

        var renderer = createRenderer(canvas, { exposure: 1.6 });
        var dims = fitRenderer(renderer, canvas);
        camera.aspect = dims.w / dims.h;
        camera.updateProjectionMatrix();

        // Bright lighting
        scene.add(new THREE.AmbientLight(0xffffff, 0.5));
        var topLight = new THREE.PointLight(NVIDIA_GREEN, 3, 25);
        topLight.position.set(0, 8, 2);
        scene.add(topLight);
        var frontLight = new THREE.DirectionalLight(0xffffff, 0.6);
        frontLight.position.set(0, 4, 8);
        scene.add(frontLight);
        var leftLight = new THREE.PointLight(NVIDIA_GREEN, 2, 15);
        leftLight.position.set(-5, 3, 3);
        scene.add(leftLight);
        var rightLight = new THREE.PointLight(NVIDIA_GREEN_BRIGHT, 2, 15);
        rightLight.position.set(5, 3, 3);
        scene.add(rightLight);

        // Grid floor
        var gridHelper = new THREE.GridHelper(20, 40, NVIDIA_GREEN, 0x1a1a1a);
        gridHelper.material.opacity = 0.3;
        gridHelper.material.transparent = true;
        scene.add(gridHelper);

        function createRack(x, z) {
            var rackGroup = new THREE.Group();

            var frame = new THREE.Mesh(
                new THREE.BoxGeometry(1, 4, 0.8),
                new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.5, metalness: 0.8 })
            );
            frame.position.y = 2;
            rackGroup.add(frame);

            // Green accents
            var stripMat = new THREE.MeshBasicMaterial({ color: NVIDIA_GREEN, transparent: true, opacity: 0.6 });
            var stripL = new THREE.Mesh(new THREE.BoxGeometry(0.04, 3.8, 0.01), stripMat);
            stripL.position.set(-0.45, 2, 0.41);
            rackGroup.add(stripL);
            var stripR = new THREE.Mesh(new THREE.BoxGeometry(0.04, 3.8, 0.01), stripMat.clone());
            stripR.position.set(0.45, 2, 0.41);
            rackGroup.add(stripR);

            for (var i = 0; i < 8; i++) {
                var unit = new THREE.Mesh(
                    new THREE.BoxGeometry(0.85, 0.15, 0.1),
                    new THREE.MeshStandardMaterial({ color: 0x2a2a2a, emissive: 0x0a0a0a, emissiveIntensity: 0.2, roughness: 0.4, metalness: 0.9 })
                );
                unit.position.set(0, 0.5 + i * 0.45, 0.4);
                rackGroup.add(unit);

                var led = new THREE.Mesh(
                    new THREE.BoxGeometry(0.06, 0.06, 0.02),
                    new THREE.MeshBasicMaterial({ color: NVIDIA_GREEN_BRIGHT, transparent: true, opacity: 1 })
                );
                led.position.set(0.35, 0.5 + i * 0.45, 0.46);
                led.userData = { baseOpacity: 0.5 + Math.random() * 0.5, speed: 1 + Math.random() * 3 };
                rackGroup.add(led);
            }

            rackGroup.position.set(x, 0, z);
            return rackGroup;
        }

        var racks = [];
        for (var row = 0; row < 3; row++) {
            for (var col = -2; col <= 2; col++) {
                var rack = createRack(col * 1.5, -row * 1.5);
                scene.add(rack);
                racks.push(rack);
            }
        }

        var isActive = false;
        var clock = new THREE.Clock();

        function animate() {
            if (!isActive) { requestAnimationFrame(animate); return; }
            var t = clock.getElapsedTime();
            racks.forEach(function (rack) {
                rack.children.forEach(function (child) {
                    if (child.userData && child.userData.baseOpacity !== undefined) {
                        child.material.opacity = child.userData.baseOpacity * (0.5 + 0.5 * Math.sin(t * child.userData.speed));
                    }
                });
            });
            camera.position.x = Math.sin(t * 0.15) * 0.4;
            camera.lookAt(0, 1, 0);
            topLight.intensity = 3 + Math.sin(t * 0.8) * 0.5;
            renderer.render(scene, camera);
            requestAnimationFrame(animate);
        }

        new IntersectionObserver(function (entries) {
            isActive = entries[0].isIntersecting;
        }, { threshold: 0.1 }).observe(canvas);

        window.addEventListener('resize', function () {
            var d = fitRenderer(renderer, canvas);
            camera.aspect = d.w / d.h;
            camera.updateProjectionMatrix();
        });

        animate();
    }

    /* ========== SCENE: OMNIVERSE WIREFRAME (Section 7) ========== */
    function initOmniverseScene() {
        var canvas = document.getElementById('omniverse-canvas');
        if (!canvas) return;

        var scene = new THREE.Scene();
        var camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
        camera.position.set(5, 4, 8);
        camera.lookAt(0, 0, 0);

        var renderer = createRenderer(canvas);
        var dims = fitRenderer(renderer, canvas);
        camera.aspect = dims.w / dims.h;
        camera.updateProjectionMatrix();

        scene.add(new THREE.AmbientLight(0xffffff, 0.15));
        var dirLight = new THREE.DirectionalLight(NVIDIA_GREEN, 0.8);
        dirLight.position.set(5, 10, 5);
        scene.add(dirLight);

        var grid = new THREE.GridHelper(20, 20, NVIDIA_GREEN, 0x0a0a0a);
        grid.material.opacity = 0.15;
        grid.material.transparent = true;
        scene.add(grid);

        // Buildings
        var buildings = [];
        function createBuilding(bw, bh, bd, x, z) {
            var edges = new THREE.EdgesGeometry(new THREE.BoxGeometry(bw, bh, bd));
            var mat = new THREE.LineBasicMaterial({ color: NVIDIA_GREEN, transparent: true, opacity: 0 });
            var wire = new THREE.LineSegments(edges, mat);
            wire.position.set(x, bh / 2, z);
            wire.userData.targetOpacity = 0.6;
            wire.userData.originalHeight = bh;
            scene.add(wire);
            buildings.push(wire);
        }

        createBuilding(3, 2, 2, -2, -1);
        createBuilding(2, 3, 1.5, 1, -2);
        createBuilding(1.5, 1.5, 3, 3, 1);
        createBuilding(2.5, 2.5, 2, -1, 2);
        createBuilding(1, 4, 1, 4, -1);
        createBuilding(2, 1.8, 2.5, -3, 2);

        var buildProgress = 0;
        var isActive = false;
        var clock = new THREE.Clock();

        window.NVScenes.omniverse = {
            setBuildProgress: function (p) { buildProgress = Math.max(0, Math.min(1, p)); }
        };

        function animate() {
            if (!isActive) { requestAnimationFrame(animate); return; }
            var t = clock.getElapsedTime();
            buildings.forEach(function (b, i) {
                var delay = i * 0.12;
                var progress = Math.max(0, Math.min(1, (buildProgress - delay) * 2));
                b.material.opacity = progress * b.userData.targetOpacity;
                b.scale.y = 0.1 + progress * 0.9;
                b.position.y = (b.userData.originalHeight / 2) * b.scale.y;
            });
            camera.position.x = 5 * Math.cos(t * 0.08);
            camera.position.z = 8 * Math.sin(t * 0.08) + 2;
            camera.lookAt(0, 0, 0);
            renderer.render(scene, camera);
            requestAnimationFrame(animate);
        }

        new IntersectionObserver(function (entries) {
            isActive = entries[0].isIntersecting;
        }, { threshold: 0.1 }).observe(canvas);

        window.addEventListener('resize', function () {
            var d = fitRenderer(renderer, canvas);
            camera.aspect = d.w / d.h;
            camera.updateProjectionMatrix();
        });

        animate();
    }

    /* ========== INIT ========== */
    window.NVScenes.init = function () {
        initGPUScene();
        initChipScene();
        initSphereScene();
        initServerScene();
        initOmniverseScene();
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () { window.NVScenes.init(); });
    } else {
        window.NVScenes.init();
    }
})();
