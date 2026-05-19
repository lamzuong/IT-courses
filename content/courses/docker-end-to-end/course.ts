import type { Course } from '@/content/courses/types';

export const course: Course = {
  slug: 'docker-end-to-end',
  title: 'Docker End-to-End',
  summary:
    'From "what is a container?" to a production-grade Compose stack. Twenty lessons, one running coffee-shop story, SVG diagrams for every concept.',
  longDescription:
    'A complete, bilingual (EN/VI) Docker course built around a single story: you are containerising a small coffee-shop platform (Next.js frontend, Node API, Postgres, Redis, Nginx). Every concept lands in that story before it lands in syntax. We start at "why containers exist" and end with a multi-service Compose stack you could run on a real server tomorrow. Each lesson has an SVG diagram, at least three runnable examples, and a recap. The why is always explained before the what — because typing commands you do not understand is how Docker becomes painful.',
  whatYoullLearn: [
    'How containers actually work — images, layers, namespaces, the Docker engine — and how that differs from VMs',
    'How to write Dockerfiles that build fast, stay small, and rebuild only the layers that changed',
    'How to persist data with volumes, expose services with networks, and pass config without baking secrets into images',
    'How to orchestrate a multi-service stack with Docker Compose: dependencies, healthchecks, profiles, overrides',
    'How to ship: registries, CI/CD, resource limits, security hardening, debugging a misbehaving container in production',
  ],
  whatYoullBuild:
    'A full-stack microservices stack — Next.js frontend, Node/Express API, Postgres, Redis, Nginx reverse proxy — wired together with Docker Compose, fronted by a single domain, with healthchecks, persistent volumes, an .env-driven config, and a CI pipeline that builds and pushes the images on every merge.',
  parts: [
    {
      title: 'Foundations',
      lessons: [
        { slug: '01-what-this-teaches',       title: 'What this course teaches',           summary: 'Why containers exist. Docker vs VM. The coffee-shop story we will containerise across 20 lessons.' },
        { slug: '02-install-first-container', title: 'Install Docker and run your first container', summary: 'Engine, daemon, CLI. `docker run hello-world` line by line. What just happened on your machine.' },
        { slug: '03-images-vs-containers',    title: 'Images vs containers',               summary: 'Image = recipe, container = running dish. Pulling, listing, removing, the lifecycle states.' },
        { slug: '04-dockerfile-fundamentals', title: 'Dockerfile fundamentals',            summary: 'FROM, RUN, COPY, WORKDIR, CMD, ENTRYPOINT. Build a Node app image from scratch.' },
      ],
    },
    {
      title: 'Building images well',
      lessons: [
        { slug: '05-layers-and-caching',   title: 'Image layers and the build cache',   summary: 'Every line is a layer. Why ordering instructions changes rebuild speed by 10×.' },
        { slug: '06-multi-stage-builds',   title: 'Multi-stage builds',                 summary: 'Build in one stage, ship in another. Cut a 1.2 GB Node image to 90 MB.' },
        { slug: '07-image-optimization',   title: 'Image optimization in practice',     summary: '.dockerignore, distroless/alpine, BuildKit cache mounts, dependency pruning.' },
        { slug: '08-tags-and-registries',  title: 'Tags, registries, and pushing',      summary: 'Semantic tags vs `latest`. Docker Hub, GHCR, private registries. Login, push, pull.' },
      ],
    },
    {
      title: 'Runtime concerns',
      lessons: [
        { slug: '09-volumes-and-data',    title: 'Volumes and persistent data',        summary: 'Bind mounts vs named volumes vs tmpfs. Where Postgres data really lives.' },
        { slug: '10-networking',          title: 'Container networking',               summary: 'Bridge, host, none. Service discovery by name. Why two containers cannot just `localhost` each other.' },
        { slug: '11-env-config-secrets',  title: 'Env vars, config, and secrets',      summary: 'ENV, --env-file, build-arg vs runtime, the secret-baking trap.' },
        { slug: '12-logs-exec-debug',     title: 'Logs, exec, and debugging a container', summary: '`docker logs`, `docker exec`, `docker stats`, `inspect`. Diagnose without rebuilding.' },
      ],
    },
    {
      title: 'Docker Compose',
      lessons: [
        { slug: '13-compose-intro',           title: 'Compose: one file, many services',   summary: 'docker-compose.yml structure. From two `docker run` commands to one `compose up`.' },
        { slug: '14-compose-networks-volumes', title: 'Compose networks, volumes, depends_on', summary: 'How services find each other. Named volumes. `depends_on` vs healthcheck-gated startup.' },
        { slug: '15-compose-real-stack',      title: 'A real multi-service stack',         summary: 'Next.js + Node API + Postgres + Redis + Nginx, wired end-to-end.' },
      ],
    },
    {
      title: 'Production',
      lessons: [
        { slug: '16-healthchecks-restart',  title: 'Healthchecks and restart policies',  summary: 'HEALTHCHECK, restart: unless-stopped, graceful shutdown, SIGTERM and PID 1.' },
        { slug: '17-limits-and-security',   title: 'Resource limits and security',       summary: 'CPU/memory caps, read-only filesystems, dropping capabilities, non-root users.' },
        { slug: '18-ci-cd',                 title: 'CI/CD: build, push, deploy',         summary: 'GitHub Actions pipeline that builds, tags, pushes, and deploys on every merge.' },
      ],
    },
    {
      title: 'Beyond a single host',
      lessons: [
        { slug: '19-orchestration-overview', title: 'Beyond Compose: Swarm and Kubernetes', summary: 'When Compose stops being enough. A quick, honest tour of Swarm and K8s and when to reach for either.' },
        { slug: '20-troubleshooting',        title: 'The troubleshooting cheat sheet',     summary: 'The 20 commands and 10 failure patterns that solve 90% of Docker problems.' },
      ],
    },
  ],
  project: { slug: 'project', title: 'Coffee-Shop Microservices Stack' },
};
