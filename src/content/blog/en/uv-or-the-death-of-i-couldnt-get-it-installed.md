---
title: "uv, or the death of \"I couldn't get it installed\""
description: "The real barrier to adopting an internal Python tool was never the code, it was the install. What uv changes in practice."
pubDate: 2026-08-31
lang: "en"
translationKey: "uv-installation-friction"
tags: ["python", "tooling", "devops", "uv"]
draft: false
---

*🇻🇳 Also available in Vietnamese: [uv, hay cái chết của câu « tôi cài không được »](/blog/vi/uv-hay-cai-chet-cua-cau-toi-cai-khong-duoc/) — 🇫🇷 Also available in French: [uv, ou la mort du « j'ai pas réussi à l'installer »](/blog/fr/uv-ou-la-mort-du-jai-pas-reussi-a-linstaller/)*

There's a hidden cost in building internal Python tools, and it's almost never the code: it's support.

For years, shipping a Python tool to a team meant, on top of the code itself: a detailed installation guide, a README that grows with every edge case, and above all, time spent debugging the environments of people who never signed up to become Python experts.

Since I switched to [uv](https://github.com/astral-sh/uv), that part has essentially disappeared. Not reduced: **gone**.

> **TL;DR**
> The main barrier to adoption of an internal Python tool isn't its quality, it's how hard it is to install. `uv` collapses installation into a single command — and with it, a large share of the support load.

---

## Before: an installation guide, and a support channel

The typical scenario, before `uv`, looked like this for pretty much any internally packaged Python tool:

1. **Write a README** with the prerequisites: Python version, how to create a venv, how to activate it.
2. **Explain `source .venv/bin/activate`** to someone who has never opened a shell in their life, then explain it again three weeks later because they forgot.
3. **Get an "it doesn't work" message** with a stack trace, and discover the person has a `python` pointing to some Python 2.7 left over by the system, or a `pip` broken by three successive global installs.
4. **Debug, remotely**, an environment you can't see, on a machine you don't control.

This isn't a skill issue on the other end. It's an onboarding problem: you're asking people whose job isn't Python to understand an entire ecosystem — venv, PATH, Python versions, dependency resolution — just to run a tool.

That support cost, repeated for every new user and every new machine, ended up holding back adoption of the tools we built: the more painful the install, the less people used it, even when the tool solved a real problem.

---

## After: one command, zero prerequisites

With `uvx`, that entire process collapses into a single, copy-pasteable line that assumes nothing on the user's side beyond `uv` itself being installed:

```bash
uvx --from git+ssh://git@gitlab.example.com/sdn/my-tool.git my-tool --help
```

No venv to create, no activation to explain, no Python version to check. `uv` downloads the package from the Git repo, resolves the dependencies, builds an isolated, ephemeral environment, and runs the tool.

The README goes from a mini installation guide to a single command.

The real gain isn't just the time saved at install time: **it's the time you never lose afterward**. No more "I'm having trouble with pip", no more "it doesn't work on my machine" caused by a misconfigured system `python`, no more remoting into someone's machine to figure out why their venv won't activate. The friction point that used to generate most of the support messages simply stopped existing.

The same benefit applies to plain Python scripts distributed on an ad-hoc basis, though the most impactful use case remains packaged tools shipped to a whole team.

### Ephemeral with `uvx`, persistent with `uv tool install`

`uvx` runs the tool in an ephemeral environment, rebuilt on every call — great for one-off use or for always getting the latest version.

But once a tool becomes part of someone's daily routine, it's often nicer to have it installed once and available directly on the PATH, without going through `uvx` every time. That's what `uv tool install` is for:

```bash
uv tool install git+ssh://git@gitlab.example.com/sdn/my-tool.git
```

The tool gets installed into its own isolated environment (still with no venv for the user to manage) and exposed directly as a command-line tool. A `uv tool upgrade my-tool` is then enough to update it.

You keep the exact same benefit as with `uvx` — no prerequisites, no environment concepts to understand — but with the persistence of a regular install for the tools people actually use every day.

---

## One tool instead of three or four

This shift is also enabled by a simplification further upstream: `uv` replaces, on its own, several tools that used to coexist none too gracefully.

| Before | Role | With `uv` |
| --- | --- | --- |
| `venv` / `virtualenv` | Environment isolation | `uv venv`, or implicit |
| `pip` | Installing packages | `uv pip`, `uv add` |
| `pipx` | Command-line tools | `uvx`, `uv tool install` |
| `pyenv` | Managing Python versions | `uv python install` |
| `poetry` / `pip-tools` | Lockfile and project management | `uv lock`, `uv sync` |

One coherent interface, one binary to install, one syntax to document: that's less surface area for errors, and fewer support questions from users.

---

## And dependency resolution follows the same trend

Written in Rust, `uv` ships a dependency resolver that's radically faster than pip's — on projects with a decent number of dependencies, the gap is measured in tens to hundreds of times.

A `uv sync` or `uv add` becomes near-instant, where we'd gotten used to planning around that dead time. In CI, that gain repeats on every run and adds up to a real chunk of total pipeline time.

---

## Bottom line

`uv` isn't just faster: it removes the main barrier to adoption of an internal Python tool, which was never code quality but the difficulty of installing it.

Less installation guide, less support, more adoption: for DevOps/NetOps tooling shipped to a team, that point alone outweighs any raw speed gain.
