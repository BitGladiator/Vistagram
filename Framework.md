# Vistagram Framework Documentation

## Project Overview

**Vistagram** is a scalable social media platform for sharing visual moments and connecting through photography. This document outlines the complete system design framework, architectural decisions, and implementation strategy.

---

## 1. System Requirements

### 1.1 Functional Requirements

#### Core Features
- **User Management**
  - User registration and authentication
  - Profile creation and editing (bio, profile picture, username)
  - Account privacy settings (public/private)

- **Content Management**
  - Upload photos and videos with captions
  - Add hashtags and location tags
  - Edit/delete own posts
  - Support multiple image formats (JPEG, PNG, HEIC)
  - Video processing and compression

- **Social Interactions**
  - Follow/unfollow users
  - Like posts
  - Comment on posts
  - Reply to comments
  - Tag users in posts

- **Feed System**
  - Personalized home feed (posts from followed users)
  - Chronological and algorithm-based feed options
  - Explore feed (discover new content)
  - User profile feed (view specific user's posts)

- **Discovery**
  - Search users by username
  - Search hashtags
  - Trending content
  - Location-based discovery

- **Notifications**
  - Real-time notifications for likes, comments, follows
  - Push notifications support
  - In-app notification center

### 1.2 Non-Functional Requirements

#### Scale Targets
![Targets](images/Target.jpg)

#### Performance Requirements
![Performance](images/Performance.jpg)

#### Availability & Reliability
![Availability](images/Availablity.jpg)

#### Consistency Requirements
![Consistency](images/Consistency.jpg)

---

## 2. High-Level Architecture
![Design](images/High-Level%20Design.jpg)

### 2.2 Core Components

#### Client Layer
- **Web Application**: React/Next.js SPA
- **Mobile Apps**: iOS (Swift) and Android (Kotlin)
- **Progressive Web App** (PWA) support

#### Edge Layer
- **CDN**: CloudFlare/CloudFront for static assets and media
- **Load Balancers**: Distribute traffic across API servers
- **DDoS Protection**: Rate limiting and security

#### API Gateway
- **Authentication & Authorization**: JWT tokens
- **Request Routing**: Direct requests to appropriate services
- **Rate Limiting**: Prevent abuse
- **API Versioning**: Support multiple API versions
- **Protocol Translation**: REST to gRPC

#### Service Layer (Microservices)
![Service](images/Service%20Architecture.jpg)

---

## 3. Data Architecture

### 3.1 Database Strategy

#### Primary Databases

**1. User Data - PostgreSQL (Relational)**
![Users](images/User%20Schema.jpg)

**2. Post Data - PostgreSQL (Relational)**
![Posts](images/Post%20Schema.jpg)

**3. Social Graph - PostgreSQL (Relational)**
![Social](images/Social.jpg)
