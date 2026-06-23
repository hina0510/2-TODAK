# IMPLEMENTATION_PLAN.md

# TODAK Implementation Plan

## Project Goal

Implement TODAK as a mobile web application using:

* HTML5
* CSS3
* Vanilla JavaScript
* Supabase

Follow the Figma design exactly.

Do not redesign components.

---

# Development Workflow

## Phase 1

Project Setup

Goal:

Create the project structure.

Expected Output:

```txt
index.html
login.html
signup.html
record.html
guide.html
mypage.html

css/
js/
image/
supabase/
```

Prompt:

Analyze the attached Figma design and create the initial project structure.

Do not implement functionality yet.

---

## Phase 2

Design System

Goal:

Create reusable design tokens.

Tasks:

* Colors
* Typography
* Buttons
* Inputs
* Cards
* Modals

Files:

```txt
css/color.css
css/common.css
```

Prompt:

Create reusable design system files based on the attached Figma.

Do not implement business logic.

---

## Phase 3

Authentication UI

Goal:

Build Login and Signup pages.

Pages:

* login.html
* signup.html

Requirements:

Login

* Email
* Password

Signup

* Name
* Email
* Password
* Confirm Password

Role Selection

* Mother
* Caregiver

Prompt:

Implement Login and Signup UI only.

No Supabase integration.

---

## Phase 4

Onboarding

Goal:

Build Initial Setup Flow.

Mother

* Pregnancy Nickname
* Birth Status
* Due Date

Caregiver

* Mother Code

Prompt:

Implement onboarding modal and UI only.

No database integration.

---

## Phase 5

Home Screen

Goal:

Build Home UI.

Components:

* Character Area
* Pregnancy/Birth Toggle
* D-Day
* Baby Age
* Stage Card
* Today's TODAK
* Floating Button
* Bottom Navigation

Prompt:

Implement Home Screen exactly matching Figma.

Use dummy data.

---

## Phase 6

Record Screen

Goal:

Build Record UI.

Components:

* Record Card
* Date Navigation
* Calendar Button
* Floating Button

Prompt:

Implement Record Screen using dummy data.

No database integration.

---

## Phase 7

Guide Screen

Goal:

Build Week-Based Guide UI.

Requirements:

* Current Week
* Week Guide Cards
* No Search Bar

Prompt:

Implement Guide Screen exactly matching Figma.

Use dummy data.

---

## Phase 8

My Page

Goal:

Build My Page UI.

Components:

* Profile
* Family Information
* Mother Code
* Caregiver Connection
* Checklist
* Logout

Prompt:

Implement My Page UI only.

---

# Backend Integration

## Phase 9

Supabase Setup

Goal:

Connect Supabase.

Tasks:

* Create supabase.js
* Environment configuration
* Connection test

Prompt:

Connect Supabase without modifying existing UI.

---

## Phase 10

Authentication

Goal:

Implement Auth.

Functions:

* Signup
* Login
* Logout

Prompt:

Implement Email Authentication using Supabase Auth.

---

## Phase 11

Profile Setup Save

Goal:

Save onboarding data.

Tables:

* profiles
* children
* guardians

Prompt:

Store onboarding information in Supabase.

---

## Phase 12

Record CRUD

Goal:

Implement record management.

Functions:

* Create
* Read
* Update
* Delete

Prompt:

Implement CRUD using records table.

---

## Phase 13

Storage

Goal:

Upload photos.

Requirements:

* Single Image Upload
* Save URL
* Connect to records

Prompt:

Implement Supabase Storage integration.

---

## Phase 14

Calendar

Goal:

Display records by date.

Functions:

* Select Date
* Load Records
* Calendar View

Prompt:

Implement Calendar and record filtering.

---

## Phase 15

Birth Transition

Goal:

Switch Pregnancy → Birth.

Logic:

birth_status = false

↓

User selects Birth

↓

Show Birth Registration Modal

↓

Save

↓

birth_status = true

↓

Replace Character

↓

Replace D-Day with Baby Age

Prompt:

Implement Birth Transition Logic.

Show modal only once.

---

# Character System

## Pregnancy Character

5 Stages

1. 초기 적응기
2. 안정기
3. 태동기
4. 성장기
5. 출산 준비기

## Baby Character

3 Stages

1. 신생아
2. 4~6개월
3. 7~9개월

---

# Animation Phase

## Phase 16

Character Animation

Pregnancy Character

* Floating Animation

Baby Character

* Floating Animation
* Blink Animation

Rules:

* Soft motion
* Calm feeling
* No game-like effects

Prompt:

Implement subtle character animations.

---

# Testing Checklist

## Authentication

* Signup
* Login
* Logout

## Onboarding

* Mother Flow
* Caregiver Flow

## Home

* D-Day
* Baby Age
* Character Display

## Records

* Create
* Edit
* Delete
* View

## Storage

* Upload
* Load

## Guide

* Week Display

## Calendar

* Date Filtering

## Birth Transition

* One-Time Modal
* Character Change

---

# Final Rule

Always follow Figma design.

If implementation conflicts with design:

Figma is the source of truth.
