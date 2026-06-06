---
layout: ../layouts/ArticleLayout.astro
title: "Privacy Policy"
date: "2026-06-06"
pillar: "about"
slug: "privacy-policy"
---

**Effective Date:** May 9, 2026

Self Health Living ("we", "us", or "our") operates the **SelfHealth** iOS application (the "App"). This Privacy Policy explains how we collect, use, store, and protect your personal information. By using the App, you agree to the collection and use of information in accordance with this policy.

## 1. Information Collection & Usage

To provide a personalized health experience, we collect data in the following ways:

- **Account Data:** Email and password used for authentication and cross-device syncing via Supabase.
- **User-Entered Health Data:** Lab result values (e.g., cholesterol, glucose), cycle tracking entries, and personal health notes.
- **HealthKit Integration:** With your permission, we read metrics like heart rate, HRV, and sleep. This data is processed locally to generate health scores and shared with AI providers only when you request specific coaching insights.
  - *HealthKit data is never used for advertising or shared with third parties for purposes unrelated to health and fitness.*
- **Usage Data:** App interaction logs (e.g., screens visited, errors) collected anonymously for debugging and improvement.

## 2. Artificial Intelligence (AI) Features

SelfHealth utilizes Large Language Models (LLMs) to provide automated health coaching and lab analysis.

- **Providers:** We currently use **Google Gemini** (operated by Google LLC) and **Anthropic Claude**. The AI provider we use may change over time and this policy will be updated to reflect any such changes.
- **What data is sent:** When you use an AI feature, the following data may be transmitted to the AI provider: your health metrics and scores (e.g., HRV, sleep, vitals score), lab result values, biomarker data, workout and exercise history (e.g., exercises performed, weights, repetitions, and dates) and recovery indicators, and the text of your query. Raw HealthKit sensor data is never sent.
- **Your consent:** We will always ask for your explicit permission before sending any personal health data to a third-party AI service. You can review or revoke this consent at any time via Settings &rarr; AI & Data Usage.
- **Security:** Data is sent via encrypted Enterprise APIs. Your data is **never** used to train the public models of these providers.
- **Retention:** Personal data sent to AI providers is typically deleted within 30 days.
- **Third-party privacy policies:** [Google Privacy Policy](https://policies.google.com/privacy) &middot; [Anthropic Privacy Policy](https://www.anthropic.com/privacy)

*You may opt out of AI features at any time via Settings &rarr; AI & Data Usage, though this will limit personalized coaching functionality.*

## 3. Medical Disclaimer

> [!IMPORTANT]
> **Important:** All App content, including AI-generated coaching and lab analysis, is for informational purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.

## 4. Storage, Security & Deletion

- **Infrastructure:** Data is stored securely in **Supabase** with Row Level Security (RLS) and end-to-end encryption.
- **Data Control:** You can delete your account at any time via *Settings &rarr; Delete Account*. This permanently and irreversibly wipes all your data from our servers.
- **Third-Party Sales:** We never sell your health data to advertisers or third-party data brokers.

## 5. Contact Us

Questions regarding your privacy? Reach out at:

**Self Health Living**  
Email: [privacy@selfhealthliving.com](mailto:privacy@selfhealthliving.com)  
Web: [selfhealthliving.com](https://selfhealthliving.com)
