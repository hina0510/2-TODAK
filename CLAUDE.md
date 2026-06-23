# CLAUDE.md

# TODAK (토닥)

## Project Overview

TODAK is a mobile web application that supports parents through pregnancy, birth, and childcare by providing growth records, family connections, checklists, and week-based guides.

Core Philosophy:

"부모와 아이의 모든 처음을 함께 토닥이는 성장 기록 앱"

TODAK helps parents record meaningful moments while providing emotional support throughout pregnancy, birth, and parenting.

---

# Tech Stack

## Frontend

* HTML5
* CSS3
* Vanilla JavaScript

## Backend

* Supabase Auth
* Supabase Database
* Supabase Storage
* Supabase RLS

---

# Important Rules

## Development Rules

1. Do NOT use React.
2. Do NOT use TypeScript.
3. Do NOT use any frontend framework.
4. Use only HTML, CSS, JavaScript.
5. Follow Figma design exactly.
6. Do not redesign UI without approval.
7. Reuse components whenever possible.
8. Write clear comments.
9. Implement only requested scope.
10. Mobile Web App only.

---

# Mobile App Rules

Target Width:

390px ~ 430px

Examples:

* Galaxy S25+
* iPhone 15
* iPhone 16

Requirements:

* Mobile-first layout
* App-like UI
* No desktop sidebar
* No desktop-specific layouts

---

# Design System

## Colors

Primary Navy

#2F4B7C

Meaning:

* Trust
* Stability
* Protection

Primary Magenta

#D94F8A

Meaning:

* Love
* Empathy
* Warmth

Primary Lavender

#E3C3FF

Meaning:

* Precious Child
* New Life
* Growth

Neutral Gray

#8A8F98

Background Beige

#F6EFE8

---

# Branding

Logo Concept

Parent + Child

* T = Parent
* D = Parent
* Lavender Circle = Child

The logo should remain simple and scalable.

Characters are separate from the logo.

---

# User Roles

## Mother

Can:

* Create child profile
* Create records
* Edit records
* Delete records
* Invite caregivers

## Caregiver

Can:

* View shared information
* View growth records
* View checklists

Requires Mother Code.

Multiple caregivers are supported.

---

# Authentication

Supported:

* Email Signup
* Email Login
* Logout

Not Supported:

* Google Login
* Kakao Login

---

# Initial Setup

After signup:

## Mother

Fields:

* Pregnancy Nickname
* Birth Status
* Due Date

## Caregiver

Fields:

* Mother Code

Example:

TDK-8A7F2K

---

# Home Screen

Components:

* Character Area
* Pregnancy/Birth Toggle
* D-Day
* Baby Age
* Stage Card
* Today's TODAK
* Floating Action Button

---

# Pregnancy Stages

Stage 1

초기 적응기

4 ~ 11 weeks

Stage 2

안정기

12 ~ 19 weeks

Stage 3

태동기

20 ~ 27 weeks

Stage 4

성장기

28 ~ 35 weeks

Stage 5

출산 준비기

36 weeks ~ Birth

---

# Birth Stages

Stage 1

신생아

Stage 2

4~6개월

Stage 3

7~9개월

---

# Character System

## Pregnancy Character

5 Stages

Visual:

Heart Character

Animation:

* Floating
* Optional Blink

## Baby Character

3 Stages

Visual:

Baby Illustration

Animation:

* Floating
* Optional Blink
* Optional Blush

Animations must feel calm and supportive.

Avoid game-like effects.

---

# Records

## Pregnancy Records

Fields:

* Ultrasound Image
* Pregnancy Week
* Checkup Memo
* Notes

## Birth Records

Fields:

* Baby Photo
* Height
* Weight
* Feeding
* Baby Food
* Notes

Image Upload:

1 Image Only

---

# Calendar

Features:

* Calendar View
* Date Selection
* Daily Record Lookup

Clicking a date displays records for that day.

---

# Today's TODAK

Daily Checklist System

Success Rule:

3 or more completed items

= Success

---

# Checklist

12 Types

Shared between Mother and Caregiver.

---

# Guide

Guide Type:

Week-Based Guide

Examples:

* Week 12
* Week 20
* Week 32

Requirements:

* No Search Bar
* Show Current Week
* Show Week Guide

---

# Birth Transition Logic

Initial State:

birth_status = false

When Birth is selected:

Show Birth Registration Modal.

Fields:

* Baby Name
* Gender
* Birth Date
* Height
* Weight

After Save:

* birth_status = true
* Replace nickname with baby name
* Replace pregnancy character
* Display baby age

The modal should only appear once.

---

# My Page

Sections:

* My Profile
* Family Information
* Caregiver Connection
* Mother Code
* Checklist
* Logout

No separate settings page.

---

# Supabase

## Services

* Auth
* Database
* Storage
* RLS

## Tables

profiles

children

guardians

records

---

# Security

Use RLS for all user data.

Users must only access:

* Their own profile
* Their own children
* Shared caregiver records

Never expose unrelated user data.
