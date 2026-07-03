# ===========================================
# Hyundai Network Monitoring (NOC)
# ===========================================

NetPulse Enterprise

Enterprise Network Operations Center (NOC)

Version 1.0 Enterprise Edition

=============================================

# ROLE

You are an Elite Software Architect, Enterprise Solution Architect, Senior Python Developer, Senior React Developer, Senior UI/UX Designer, Senior DevOps Engineer, Network Engineer and Product Designer.

You have over 20 years of experience building enterprise software for Fortune 500 companies.

Your responsibility is to build a production-ready Enterprise Network Monitoring Platform.

Never generate demo code.

Never generate placeholder code.

Never generate pseudo code.

Generate production-quality code only.

Every file must be complete.

Every component must be reusable.

Every function must be documented.

Every API must be production-ready.

=============================================

# PROJECT GOAL

Develop a complete Enterprise Network Operations Center (NOC) Monitoring Platform.

This platform will monitor Internet Connectivity and Power Availability in real-time using Microsoft Excel as the primary data source.

Whenever ANY CELL changes inside the Excel workbook, the dashboard must update instantly without pressing any refresh button.

The platform must feel like commercial enterprise software similar to:

• SolarWinds Orion
• PRTG Enterprise Monitor
• Grafana Enterprise
• Datadog
• Cisco DNA Center
• Zabbix Enterprise
• Microsoft Azure Monitor
• Splunk Enterprise

This is NOT a school project.

This is NOT an admin panel.

This is NOT a CRUD application.

This is an Executive Enterprise Monitoring Platform.

=============================================

# TARGET USERS

This application will be used by:

CEO

COO

CFO

CTO

CIO

CCO

CISO

HOD

Network Administrator

NOC Engineer

Support Engineer

Operations Team

Senior Management

=============================================

# BUSINESS OBJECTIVE

Executives should understand the overall infrastructure health within five seconds.

Network Engineers should be able to analyze every network metric in detail.

Management should immediately know:

Is Internet Available?

How healthy is the network?

Is there any outage?

How much downtime occurred today?

What is today's SLA?

Are there any critical alerts?

=============================================

# CORE REQUIREMENTS

The system must provide:

Real-time Monitoring

Executive Dashboard

Historical Analytics

Network Performance Analysis

Power Availability Monitoring

Incident Tracking

Alert Management

Trend Analysis

Health Score

Reporting

=============================================

# POWER MONITORING SCOPE

Power monitoring is intentionally simple.

Do NOT build a complete electrical monitoring system.

Monitor only:

Power Status

Power Outage Detection

Power Outage Start Time

Power Outage End Time

Downtime Duration

Power Availability Percentage

=============================================

# NETWORK MONITORING SCOPE

Monitor and display:

Internet Status

Download Speed

Upload Speed

Ping

Jitter

DNS Response Time

Packet Loss

Bandwidth Utilization

Response Time

Timeout Count

Network Availability

SLA

Health Score

Average Performance

Peak Performance

Historical Trends

=============================================

# REAL TIME REQUIREMENT

The dashboard MUST update automatically.

No Refresh button.

No browser reload.

No manual refresh.

No polling every few seconds.

Instead use:

Python Watchdog

FastAPI

Socket.IO

WebSockets

Whenever ONE CELL changes:

Excel

↓

Watchdog detects change

↓

Backend processes only changed data

↓

Socket broadcasts update

↓

Frontend receives update

↓

Only affected components re-render

Total delay should ideally be under one second.

=============================================

# DATA SOURCE

Microsoft Excel

The Excel workbook acts as the primary database.

Do not migrate to SQL.

Do not require MySQL.

Do not require PostgreSQL.

Everything must work directly from Excel.

Backend continuously watches the workbook.

=============================================

# TECHNOLOGY STACK

Frontend

React

TypeScript

Vite

TailwindCSS

Framer Motion

React Router

React Query

Socket.IO Client

Recharts

Lucide Icons

Backend

Python

FastAPI

Watchdog

Pandas

OpenPyXL

Socket.IO

Uvicorn

Utilities

Pydantic

Logging

Environment Variables

Configuration Files

=============================================

# PROJECT ARCHITECTURE

Frontend

↓

Socket.IO

↓

FastAPI

↓

Watchdog

↓

Excel Workbook

Everything must be modular.

Everything must be scalable.

Everything must follow enterprise architecture.

=============================================

# DEVELOPMENT RULES

Never hardcode values.

Never duplicate logic.

Never write large components.

Prefer reusable architecture.

Use proper folder structure.

Use interfaces.

Use configuration files.

Use constants.

Use reusable utility functions.

Write maintainable code.

Follow SOLID principles.

Follow Clean Architecture.

Follow enterprise coding standards.

=============================================

# ===========================================
PART 2
ENTERPRISE EXCEL WORKBOOK ARCHITECTURE
===========================================

The Microsoft Excel Workbook is the PRIMARY DATABASE.

Do NOT treat Excel as a simple spreadsheet.

Treat it as a structured enterprise data source.

The entire application depends on this workbook.

Design the workbook with professional architecture.

===========================================

WORKBOOK NAME

Network_And_Power_Monitoring.xlsx

===========================================

WORKBOOK STRUCTURE

The workbook must contain the following worksheets.

01_Raw_Data

02_Thresholds

03_Calculations

04_Dashboard_Data

05_Settings

06_Logs

===========================================

SHEET 01

Raw_Data

===========================================

This is the ONLY sheet where users enter data.

No calculations should exist here.

No complex formulas.

Only validated data entry.

Columns

Record ID

Date

Time

Site ID

Site Name

Region

City

ISP

Internet Status

Power Status

Download Speed (Mbps)

Upload Speed (Mbps)

Ping (ms)

Jitter (ms)

DNS Response Time (ms)

Packet Loss (%)

Bandwidth Utilization (%)

Response Time (ms)

Timeout Count

Power Outage Start

Power Outage End

Downtime Duration

Remarks

Last Updated

===========================================

COLUMN RULES

Record ID

Auto Increment

Never duplicate.

===========================================

Date

Format

YYYY-MM-DD

===========================================

Time

24 Hour Format

HH:mm:ss

===========================================

Internet Status

Dropdown

Connected

Disconnected

===========================================

Power Status

Dropdown

ON

OFF

===========================================

Download Speed

Number

Mbps

Cannot be negative.

===========================================

Upload Speed

Number

Mbps

Cannot be negative.

===========================================

Ping

Milliseconds

===========================================

Jitter

Milliseconds

===========================================

DNS Response

Milliseconds

===========================================

Packet Loss

Percentage

0

to

100

===========================================

Bandwidth Utilization

Percentage

0

to

100

===========================================

Response Time

Milliseconds

===========================================

Timeout Count

Whole Number

===========================================

Downtime Duration

Automatically calculated

Do not enter manually.

===========================================

Last Updated

Automatically generated.

===========================================

DATA VALIDATION

Apply validation on every column.

Reject invalid values.

Reject text inside numeric columns.

Reject negative speeds.

Reject Packet Loss greater than 100.

Reject Bandwidth greater than 100.

===========================================

CONDITIONAL FORMATTING

Download Speed

Green

Above Threshold

Yellow

Warning

Red

Critical

-------------------------------------------

Upload Speed

Same logic.

-------------------------------------------

Ping

Green

Good

Orange

Warning

Red

Critical

-------------------------------------------

Jitter

Green

Below Threshold

Orange

Warning

Red

Critical

-------------------------------------------

DNS Response

Green

Fast

Orange

Medium

Red

Slow

-------------------------------------------

Packet Loss

Green

Zero

Orange

Low

Red

High

-------------------------------------------

Bandwidth Utilization

Green

Normal

Orange

Busy

Red

Overloaded

-------------------------------------------

Internet Status

Connected

Green

Disconnected

Red

-------------------------------------------

Power Status

ON

Green

OFF

Red

===========================================

SHEET 02

Thresholds

===========================================

This sheet stores every configurable limit.

Nothing should be hardcoded.

Columns

Metric

Good

Warning

Critical

Example

Download Speed

100

50

20

Upload Speed

50

20

10

Ping

30

80

150

Jitter

10

20

30

DNS Response

20

40

80

Packet Loss

0

2

5

Bandwidth Utilization

70

90

100

===========================================

The backend must always read threshold values from this sheet.

Never hardcode threshold values.

===========================================

SHEET 03

Calculations

===========================================

Automatically calculate

Average Download

Average Upload

Average Ping

Average Jitter

Average DNS

Average Packet Loss

Average Bandwidth

Average Response Time

Maximum Download

Maximum Upload

Maximum Ping

Maximum Packet Loss

Maximum Jitter

Today's Downtime

Weekly Downtime

Monthly Downtime

Internet Availability %

Power Availability %

SLA %

Current Health Score

Total Alerts

Critical Alerts

Warning Alerts

===========================================

HEALTH SCORE

Create a weighted score.

Weights

Download

20%

Upload

10%

Ping

15%

Jitter

10%

DNS Response

10%

Packet Loss

15%

Bandwidth Utilization

10%

Internet Status

5%

Power Status

5%

Total

100%

Normalize every metric.

Final Result

95-100

Excellent

85-94

Good

70-84

Fair

Below 70

Critical

===========================================

SHEET 04

Dashboard_Data

===========================================

This sheet is generated automatically.

The frontend reads ONLY this sheet.

Store

Current KPIs

Latest Values

Chart Data

Trend Data

Alert Data

Health Score

Availability

Downtime

SLA

Recent Events

Everything should be optimized for fast reading.

===========================================

SHEET 05

Settings

===========================================

Store

Company Name

Company Logo

Dashboard Title

Refresh Configuration

Theme

Timezone

Date Format

Time Format

Alert Sound

Language

===========================================

SHEET 06

Logs

===========================================

Automatically log

Every Excel Change

Every Alert

Every Connection

Every Error

Every Dashboard Update

Columns

Timestamp

User

Action

Previous Value

New Value

Status

===========================================

BEST PRACTICES

Never modify Raw_Data.

Always calculate inside Calculations.

Never hardcode formulas.

Never hardcode thresholds.

Every calculation must be dynamic.

If one cell changes

Only recalculate affected metrics.

Never reload the complete workbook.

Optimize for large datasets.

Support more than 500,000 rows.

Use Excel Tables.

Use Named Ranges.

Use structured references.

Maintain enterprise naming conventions.

===========================================

# ==========================================================
PART 3
ENTERPRISE PYTHON BACKEND ARCHITECTURE
==========================================================

ROLE

You are a Principal Python Software Engineer.

Design a production-ready backend using modern enterprise architecture.

Do NOT write beginner code.

Do NOT place business logic inside API routes.

Everything must be modular.

Everything must be scalable.

==========================================================

BACKEND TECHNOLOGY

Python 3.13+

FastAPI

Socket.IO

Uvicorn

Pandas

OpenPyXL

Watchdog

Pydantic

AsyncIO

Loguru

Python-dotenv

Cachetools

orjson

==========================================================

BACKEND OBJECTIVES

The backend is responsible for

Reading Excel

Watching Excel

Processing Excel

Calculating KPIs

Calculating Health Score

Generating Alerts

Updating Dashboard Data

Broadcasting Live Updates

Managing API Requests

Managing WebSocket Connections

Maintaining Logs

==========================================================

DO NOT USE

Flask

Django

Polling

Thread Sleep Loops

Repeated File Reads

Blocking Operations

Hardcoded Paths

Global Variables

Monolithic Code

==========================================================

PROJECT STRUCTURE

backend/

app/

api/

core/

config/

constants/

database/

excel/

services/

repositories/

models/

schemas/

socket/

watchers/

calculations/

alerts/

health/

analytics/

utils/

middlewares/

logs/

tests/

main.py

==========================================================

RESPONSIBILITIES

main.py

Application Entry Point

Load Configuration

Register APIs

Register Socket

Initialize Watchdog

Start Services

==========================================================

API Layer

Only receives requests.

Never perform calculations.

Never access Excel directly.

Never calculate Health Score.

Only call Services.

==========================================================

SERVICE LAYER

Contains all business logic.

Examples

ExcelService

DashboardService

HealthService

AlertService

AnalyticsService

RealtimeService

==========================================================

REPOSITORY LAYER

Responsible for reading Excel.

No calculations.

No API logic.

Only data access.

==========================================================

UTILITIES

Date Utilities

Time Utilities

Logger

Validators

Converters

Excel Helpers

Math Helpers

==========================================================

CONFIGURATION

Use

.env

Never hardcode

Excel File Path

Socket Port

API Port

Timezone

Threshold Values

Log Folder

==========================================================

EXCEL ENGINE

Only one service can access Excel.

Create

ExcelRepository

Responsibilities

Read Workbook

Read Sheet

Read Row

Read Cell

Read Named Range

Read Dashboard Data

Read Thresholds

Read Settings

Return DataFrames

==========================================================

WATCHDOG ENGINE

Use Python Watchdog.

Monitor Excel continuously.

Do NOT poll every second.

Watch for

Modified

Created

Renamed

Moved

Deleted

Only Modified events should trigger dashboard updates.

==========================================================

CHANGE DETECTION

When Excel changes

Determine

Which Sheet Changed

Which Row Changed

Which Column Changed

Which Cells Changed

Only update affected calculations.

Do NOT reload entire workbook.

==========================================================

PROCESS FLOW

Excel Cell Updated

↓

Watchdog detects event

↓

ExcelRepository reloads only required sheet

↓

Validate Data

↓

Recalculate affected metrics

↓

Update Dashboard_Data sheet

↓

Generate Alerts

↓

Calculate Health Score

↓

Broadcast WebSocket Event

↓

Frontend receives update

↓

Only affected widgets animate

==========================================================

REALTIME ENGINE

Implement

Socket.IO

Every connected client automatically receives updates.

No browser refresh.

No polling.

Support unlimited clients.

==========================================================

SOCKET EVENTS

client_connected

client_disconnected

dashboard_update

kpi_update

chart_update

alert_update

health_update

internet_status_update

power_status_update

settings_update

==========================================================

DATA OPTIMIZATION

Never send unnecessary data.

Only send changed values.

Example

If Download Speed changes

Only broadcast

Download Speed

Health Score

Related Charts

Do NOT send everything.

==========================================================

CACHE

Use in-memory cache.

Cache

Thresholds

Settings

Dashboard Data

Avoid reading Excel repeatedly.

==========================================================

HEALTH ENGINE

Create dedicated service

HealthService

Responsibilities

Calculate Health Score

Calculate Network Quality

Calculate Availability

Calculate SLA

Return Summary

==========================================================

ALERT ENGINE

Create AlertService

Rules

Internet Down

Power OFF

High Ping

High Jitter

High DNS

High Packet Loss

High Bandwidth

Generate

Severity

Timestamp

Message

Recommendation

==========================================================

ANALYTICS ENGINE

Calculate

Hourly

Daily

Weekly

Monthly

Average

Maximum

Minimum

Trend

Availability

Downtime

==========================================================

LOGGING

Use Loguru

Create Logs

System Logs

API Logs

Excel Logs

Socket Logs

Errors

Warnings

Performance Logs

==========================================================

ERROR HANDLING

Application must never crash.

If Excel file locked

Retry

If workbook missing

Show meaningful error

If invalid data

Ignore row

Log issue

Continue running

==========================================================

PERFORMANCE

Support

500,000+ rows

100+ concurrent users

Instant updates

Memory efficient

Fast startup

==========================================================

API DESIGN

/api/dashboard

/api/kpis

/api/charts

/api/alerts

/api/health

/api/settings

/api/sites

/api/history

/api/reports

==========================================================

SECURITY

Validate every request.

Sanitize input.

Protect file paths.

Prevent malformed requests.

Return proper HTTP status codes.

==========================================================

CODE QUALITY

Follow SOLID Principles

Follow Clean Architecture

Use Type Hints

Use Dependency Injection

Use Async Programming

Write Docstrings

Write Unit Tests

Keep functions under 50 lines where practical.

No duplicated code.

==========================================================

SUCCESS CRITERIA

When a user changes ONE CELL inside Excel

Within one second

Watchdog detects change

↓

Backend processes only affected data

↓

Health Score recalculates

↓

Alerts update

↓

Dashboard_Data updates

↓

Socket broadcasts update

↓

Frontend animates changed components

↓

No refresh button

↓

No browser reload

↓

No polling

The application should behave like a premium enterprise monitoring platform.

==========================================================
# ==========================================================
PART 4
ENTERPRISE FRONTEND ARCHITECTURE
EXECUTIVE USER EXPERIENCE
==========================================================

ROLE

You are a Principal React Architect,
Senior UI/UX Designer,
Apple Design Expert,
Enterprise Product Designer,
Frontend Performance Engineer.

Build an Executive-Class Enterprise Dashboard.

This application must NOT look like a Bootstrap admin panel.

It must look like a commercial enterprise SaaS platform.

==========================================================

DESIGN PHILOSOPHY

Create a premium enterprise interface inspired by

Apple Vision Pro

Apple Liquid Glass

Stripe Dashboard

Linear

Notion

Arc Browser

Datadog

Grafana Enterprise

Microsoft Fluent Design

Tesla Fleet Dashboard

Cisco DNA Center

The final design should be clean,
minimal,
luxurious,
professional,
executive friendly.

==========================================================

DESIGN PRINCIPLES

Less is More

White Space

Information Hierarchy

Pixel Perfect Alignment

Minimal Icons

Readable Typography

Soft Shadows

Elegant Glass

Smooth Motion

Fast Performance

==========================================================

TECH STACK

React 19

TypeScript

Vite

TailwindCSS

Framer Motion

React Router

React Query

Socket.IO Client

Recharts

Lucide Icons

React Hook Form

Zod

==========================================================

FOLDER STRUCTURE

frontend/

src/

assets/

components/

layouts/

pages/

hooks/

services/

store/

context/

theme/

animations/

icons/

charts/

tables/

cards/

widgets/

utils/

constants/

config/

types/

styles/

==========================================================

APPLICATION LAYOUT

The application should use a modern enterprise layout.

-----------------------------------

Top Navigation Bar

-----------------------------------

Contains

Company Logo

Application Name

Current Date

Current Time

Last Updated

Live Connection Indicator

Notification Bell

Theme Toggle

User Profile

Settings

-----------------------------------

Left Sidebar

-----------------------------------

Dashboard

Live Monitoring

Analytics

Sites

Reports

Alerts

History

Configuration

Settings

Help

Sidebar must be collapsible.

Animated.

Responsive.

==========================================================

MAIN DASHBOARD

Top Section

Executive Summary

Middle Section

Charts

Bottom Section

Events

Alerts

History

==========================================================

TOP HERO SECTION

The first thing executives should see.

Contains

Overall Network Health Score

Overall Internet Status

Overall Power Status

Today's SLA

Today's Downtime

Critical Alerts

System Availability

==========================================================

HEALTH SCORE CARD

This should be the largest card.

Display

Health Score

Percentage

Status

Excellent

Good

Fair

Critical

Animated Circular Progress

Trend

Previous Value

Last Updated

Hover Effect

Glass Effect

==========================================================

SECOND ROW

LIVE KPI CARDS

Create premium KPI cards for

Internet Status

Power Status

Download Speed

Upload Speed

Ping

Jitter

DNS Response Time

Packet Loss

Bandwidth Utilization

Response Time

Timeout Count

Availability

SLA

Each card should contain

Icon

Large Value

Small Label

Trend Indicator

Sparkline

Status Color

Last Updated

Hover Animation

==========================================================

THIRD ROW

LIVE CHARTS

Download Speed Trend

Upload Speed Trend

Ping Trend

Jitter Trend

DNS Trend

Bandwidth Trend

Packet Loss Trend

Downtime Trend

Availability Trend

Health Score Trend

Charts update automatically.

Animate smoothly.

==========================================================

FOURTH ROW

TABLES

Latest Records

Recent Alerts

Latest Incidents

Downtime History

Network Events

System Logs

==========================================================

ALERT PANEL

Display

Critical

Warning

Information

Resolved

Each alert contains

Timestamp

Severity

Description

Recommendation

Affected Metric

Animated Badge

==========================================================

REALTIME

Use Socket.IO

No polling.

No refresh.

Cards update instantly.

Charts animate smoothly.

Numbers count up/down.

==========================================================

LIGHT MODE

Professional White

Soft Gray Background

Premium Cards

Clean Borders

Blue Accent

High Readability

==========================================================

DARK MODE

Default Theme

Deep Navy

Glass Cards

Soft Glow

Blue Accent

Cyan Accent

Excellent Contrast

==========================================================

GLASSMORPHISM

Apply only on

Navbar

Sidebar

Cards

Dialogs

Notifications

Dropdowns

Avoid heavy blur on tables.

Keep charts crystal clear.

==========================================================

COLOR PALETTE

Background

#0B1220

Surface

#111827

Glass

rgba(255,255,255,0.08)

Border

rgba(255,255,255,0.12)

Primary

#3B82F6

Cyan

#06B6D4

Green

#22C55E

Orange

#F59E0B

Red

#EF4444

Purple

#8B5CF6

Text

#F8FAFC

Secondary Text

#94A3B8

==========================================================

TYPOGRAPHY

Use

Inter

Geist

SF Pro Display

Large Numbers

Medium Titles

Small Captions

Excellent spacing.

==========================================================

ANIMATIONS

Framer Motion

Page Transition

Fade

Scale

Slide

Glass Reflection

Card Hover

Button Ripple

Live Pulse

Counter Animation

Chart Animation

Sidebar Animation

Notification Slide

Loading Skeleton

Hover Glow

Connection Pulse

Health Score Animation

Keep everything elegant.

Avoid gaming effects.

==========================================================

RESPONSIVENESS

Desktop

Laptop

Tablet

Large NOC Display

4K Monitor

Ultra Wide

==========================================================

ACCESSIBILITY

Keyboard Navigation

Screen Reader Friendly

High Contrast

Responsive Font Scaling

Accessible Color Palette

==========================================================

PERFORMANCE

Lazy Loading

Memoization

Reusable Components

Virtual Tables

Optimized Charts

Minimal Re-render

==========================================================

EXECUTIVE EXPERIENCE

When the CEO opens the application

they should immediately understand

Network Health

Internet Status

Critical Alerts

Today's Downtime

SLA

Health Score

within five seconds.

The interface must look like software
worth over $100,000.

==========================================================

# ==========================================================
PART 5
ENTERPRISE DESIGN SYSTEM
APPLE INSPIRED EXECUTIVE UI
==========================================================

ROLE

You are one of the world's best UI/UX Designers.

You have worked at

Apple

Stripe

Linear

Microsoft

Tesla

Figma

Notion

Datadog

Your responsibility is NOT to build a dashboard.

Your responsibility is to design an unforgettable Executive Experience.

==========================================================

DESIGN GOAL

When someone opens this application,

their first reaction should be

"This looks like a premium enterprise platform."

The interface should feel expensive.

Elegant.

Modern.

Professional.

Luxurious.

Confident.

Minimal.

Readable.

==========================================================

DESIGN PHILOSOPHY

Use

Apple Human Interface Guidelines

Apple Vision Pro

Apple Liquid Glass

Microsoft Fluent

Stripe Dashboard

Linear

Arc Browser

Tesla Fleet

Datadog

Grafana Enterprise

Blend them together.

Do NOT copy them.

Create your own unique Executive Design Language.

==========================================================

VISUAL STYLE

Premium Enterprise

Minimal

Elegant

Professional

Luxury

Corporate

Executive

Readable

Modern

Clean

Timeless

==========================================================

DESIGN LANGUAGE

Everything should feel

Soft

Smooth

Premium

Balanced

Organized

Structured

Consistent

Nothing should feel random.

==========================================================

SPACING SYSTEM

Use an 8-point Grid System.

Spacing

4

8

12

16

24

32

40

48

64

96

Never use random spacing.

==========================================================

BORDER RADIUS

Small

8px

Medium

16px

Large

24px

Extra Large

32px

Hero Cards

40px

==========================================================

SHADOW SYSTEM

Very Soft

Soft

Medium

Floating

Glass Shadow

Never use harsh shadows.

==========================================================

GLASS SYSTEM

Glass should be subtle.

Glass is not decoration.

Glass improves elegance.

Apply Glass only to

Navigation

Sidebar

Hero Cards

Dialogs

Notifications

Context Menus

Dropdowns

Search Box

Do NOT apply glass on

Large Tables

Charts

Data Grids

==========================================================

BLUR

Use

8px

12px

16px

Maximum

Never overuse blur.

==========================================================

COLOR SYSTEM

Primary

Blue

Secondary

Cyan

Success

Green

Warning

Orange

Danger

Red

Accent

Purple

Neutral

Gray

==========================================================

LIGHT THEME

Background

Pure White

Very Light Gray

Soft Cards

Thin Borders

Elegant Shadows

Minimal Contrast

Premium Feel

==========================================================

DARK THEME

Default Theme

Deep Navy

Soft Black

Glass Cards

Blue Accent

Cyan Accent

High Contrast Text

Soft Glow

==========================================================

THEME ENGINE

Theme switching must be instant.

No reload.

No flickering.

Remember user preference.

Animate transition.

==========================================================

TYPOGRAPHY

Primary Font

Inter

Secondary Font

SF Pro Display

Optional

Geist

Weights

300

400

500

600

700

Large KPI Numbers

Bold

Small Labels

Medium

Captions

Light

Excellent readability.

==========================================================

ICONOGRAPHY

Use Lucide Icons.

Every icon must have purpose.

No decorative icons.

Icons should communicate meaning.

==========================================================

BUTTONS

Primary

Glass Button

Secondary

Outline Button

Danger

Red Button

Success

Green Button

Ghost Button

Icon Button

Loading Button

Buttons should animate.

==========================================================

INPUTS

Rounded

Soft Border

Focus Glow

Floating Label

Error State

Success State

Disabled State

==========================================================

TABLES

Premium Enterprise Tables

Sticky Header

Column Sorting

Column Filtering

Search

Pagination

Hover Animation

Responsive

Alternating Row Background

==========================================================

CARDS

Executive KPI Cards

Large Number

Label

Mini Chart

Trend

Icon

Last Updated

Status Color

Hover Animation

Glass Effect

==========================================================

HEALTH SCORE CARD

This is the Hero Component.

Largest Card.

Animated Circular Progress.

Glow Effect.

Trend Indicator.

Previous Value.

Recommendation.

Risk Level.

==========================================================

NETWORK STATUS CARD

Large Status Indicator.

Green Pulse

Orange Pulse

Red Pulse

Animated Ring

==========================================================

POWER STATUS CARD

Simple

Minimal

Executive

Green

Power ON

Red

Power OFF

==========================================================

LIVE INDICATORS

Green Pulse

System Healthy

Yellow Pulse

Warning

Red Pulse

Critical

Pulse animation should be smooth.

==========================================================

CHART DESIGN

Rounded Lines

Smooth Curves

Soft Animations

Gradient Area

Interactive Tooltips

Legend

Zoom

Responsive

==========================================================

ANIMATION ENGINE

Use Framer Motion.

Page Transition

Fade

Scale

Slide

Card Hover

Glow

Counter Animation

Chart Animation

Number Animation

Notification Animation

Sidebar Animation

Theme Animation

Dialog Animation

Loading Animation

Connection Animation

Everything should be smooth.

==========================================================

MICRO INTERACTIONS

Hover Elevation

Hover Glow

Button Ripple

Smooth Focus

Animated Icons

Card Tilt

Soft Scale

Tooltip Fade

==========================================================

NOTIFICATIONS

Glass Popup

Slide Down

Auto Close

Manual Close

Severity Colors

Icons

Timestamp

==========================================================

LOADING EXPERIENCE

Skeleton Loader

Animated Placeholder

Smooth Fade

No Layout Shift

==========================================================

EMPTY STATES

Beautiful Illustration

Helpful Message

Action Button

==========================================================

ERROR STATES

Friendly

Professional

Easy to Understand

Recovery Button

==========================================================

NOC WALL MODE

Create a dedicated Full Screen Mode.

Optimized for

55-inch

65-inch

75-inch

LED Video Walls

4K Displays

Hide Sidebar.

Increase KPI Size.

Increase Chart Size.

Large Typography.

Auto Rotate Dashboard.

==========================================================

EXECUTIVE MODE

CEO Dashboard

Very Simple

Large KPIs

Few Charts

Health Score

Downtime

Internet Status

Critical Alerts

SLA

Availability

COO Dashboard

Operations Focus

Site Availability

Downtime

Performance

CTO Dashboard

Technical Focus

All KPIs

Charts

Alerts

Detailed Analytics

NOC Engineer Dashboard

Everything

Live Logs

Live Events

Raw Metrics

Troubleshooting

==========================================================

FINAL DESIGN GOAL

The application should look like it costs over $250,000.

It should feel like premium enterprise software.

It should not resemble a free admin template.

Every pixel should feel intentional.

Every animation should feel meaningful.

Every interaction should improve usability.

When executives see the application,

they should immediately trust the platform.

==========================================================


# ==========================================================
PART 6
EXECUTIVE DASHBOARD LAYOUT
SCREEN DESIGN
USER EXPERIENCE
==========================================================

ROLE

Design the dashboard like a Fortune 500 Executive Command Center.

Do NOT create a normal admin dashboard.

Design an Enterprise Executive Command Center.

Everything should be premium.

Everything should have purpose.

==========================================================

DESIGN OBJECTIVE

Executives should understand system health within

5 Seconds.

Engineers should have access to complete details.

Information should flow naturally.

==========================================================

SCREEN LAYOUT

------------------------------------------

TOP NAVIGATION

------------------------------------------

Height

72px

Contains

Company Logo

Dashboard Name

Breadcrumb

Current Date

Current Time

Last Updated

Live Connection Status

Notification Center

Theme Switch

Fullscreen Button

User Avatar

Profile Menu

Settings

Everything aligned perfectly.

==========================================================

LEFT SIDEBAR

------------------------------------------

Width

280px

Collapsible

Animated

Glass Effect

Contains

Dashboard

Live Monitoring

Analytics

Sites

Reports

Alerts

Incident History

Settings

Help

Logout

Every menu item should have

Icon

Label

Hover Animation

Active Indicator

==========================================================

HOME DASHBOARD

The homepage must contain the following sections.

------------------------------------------

SECTION 1

Executive Summary

------------------------------------------

Large Hero Section

Contains

Overall Health Score

Internet Status

Power Status

Today's SLA

Today's Downtime

Current Alerts

Network Availability

==========================================================

HERO CARD

Largest card on dashboard.

Display

Health Score

Percentage

Status

Excellent

Good

Fair

Critical

Animated Circular Progress

Previous Score

Trend

Risk Level

Recommendation

==========================================================

SECTION 2

Live KPI Cards

------------------------------------------

Display

Internet Status

Power Status

Download Speed

Upload Speed

Ping

Jitter

DNS Response

Packet Loss

Bandwidth Utilization

Response Time

Timeout Count

Availability

SLA

Each KPI Card contains

Icon

Value

Unit

Trend

Sparkline

Last Updated

Status Badge

Hover Animation

Click Action

==========================================================

INTERACTION

Every KPI Card must be clickable.

Click Download

↓

Open detailed download analytics.

Click Ping

↓

Open latency dashboard.

Click Health Score

↓

Show score calculation.

Click Internet Status

↓

Show outage history.

Click Packet Loss

↓

Show packet statistics.

==========================================================

SECTION 3

NETWORK PERFORMANCE

------------------------------------------

Charts

Download Trend

Upload Trend

Ping Trend

Jitter Trend

DNS Trend

Bandwidth Trend

Packet Loss Trend

Health Score Trend

Charts must update live.

==========================================================

SECTION 4

POWER

------------------------------------------

Power Timeline

Outage Timeline

Today's Downtime

Weekly Downtime

Monthly Downtime

Power Availability

==========================================================

SECTION 5

LIVE ALERTS

------------------------------------------

Critical

High

Medium

Low

Each Alert

Timestamp

Severity

Metric

Description

Recommendation

Status

Assigned To

==========================================================

SECTION 6

EVENT TIMELINE

------------------------------------------

Show

Internet Connected

Internet Disconnected

Power ON

Power OFF

Excel Updated

Health Changed

Alert Generated

SLA Changed

Everything in chronological order.

==========================================================

SECTION 7

LATEST RECORDS

------------------------------------------

Enterprise Data Table

Features

Sorting

Filtering

Search

Sticky Header

Responsive

Column Resize

Pagination

Row Hover

==========================================================

SECTION 8

ANALYTICS

------------------------------------------

Today's Performance

Yesterday

Weekly

Monthly

Custom Date

Comparison

Peak Hours

Best Performance

Worst Performance

==========================================================

RIGHT SIDE PANEL

Optional

Recent Notifications

System Messages

Critical Alerts

Maintenance Window

==========================================================

DASHBOARD BEHAVIOR

When a KPI changes

Only that KPI animates.

Do NOT refresh the page.

Do NOT re-render entire dashboard.

Only affected widgets update.

==========================================================

LIVE UPDATE ANIMATION

When Download changes

Animate Number

Flash Border

Update Sparkline

Update Trend

Update Health Score

==========================================================

ALERT BEHAVIOR

Critical

Red

Blinking Border

Pulse

Warning

Orange

Soft Pulse

Information

Blue

Fade In

Resolved

Green

Fade Out

==========================================================

CEO DASHBOARD

Very Simple

Only

Health Score

Internet Status

Power Status

Today's Downtime

Availability

Critical Alerts

Top Recommendations

Maximum 8 Widgets

==========================================================

COO DASHBOARD

Focus

Operations

Downtime

Availability

Network Health

Sites

Performance

Incidents

==========================================================

CFO DASHBOARD

Focus

Business Impact

SLA

Downtime Cost (Estimated)

Availability

Monthly Reports

Trend

Executive Summary

==========================================================

CTO DASHBOARD

Complete Technical View

Health Score

Performance

Charts

Analytics

Alerts

Historical Data

KPIs

==========================================================

NOC ENGINEER DASHBOARD

Everything

Live Metrics

Live Events

Raw Data

Alerts

Logs

Charts

Tables

Incident History

==========================================================

RESPONSIVENESS

Desktop

Laptop

Tablet

Ultra Wide

2K

4K

NOC Video Wall

==========================================================

PERFORMANCE

Dashboard must load within

2 Seconds

Real-time updates

Less than 1 Second

Smooth animations

60 FPS

==========================================================

USER EXPERIENCE

No clutter.

No unnecessary widgets.

Every chart must answer a business question.

Every KPI must have purpose.

Executives should never search for information.

Important metrics should always remain visible.

==========================================================

SUCCESS CRITERIA

The finished dashboard should be comparable to

Datadog Enterprise

Grafana Enterprise

Cisco DNA Center

SolarWinds Orion

Microsoft Azure Monitor

Splunk Enterprise

The design should impress CEOs, CTOs and enterprise clients immediately.

==========================================================


# ==========================================================
PART 7
BUSINESS LOGIC
HEALTH SCORE ENGINE
SLA ENGINE
ALERT ENGINE
ANALYTICS ENGINE
==========================================================

ROLE

You are a Principal Network Engineer,
Data Scientist,
Business Intelligence Architect.

Do NOT calculate simple averages.

Create intelligent business logic.

The dashboard should provide insights,
not just numbers.

==========================================================

OBJECTIVE

Transform raw Excel values into meaningful executive information.

Executives should never interpret raw metrics.

The system should interpret data automatically.

==========================================================

NETWORK HEALTH SCORE

Create one master KPI.

Overall Network Health Score

Range

0 to 100

Display

Score

Status

Trend

Recommendation

Risk Level

==========================================================

HEALTH SCORE WEIGHTS

Download Speed

20%

Upload Speed

10%

Ping

15%

Jitter

10%

DNS Response Time

10%

Packet Loss

15%

Bandwidth Utilization

10%

Internet Status

5%

Power Status

5%

Total

100%

==========================================================

NORMALIZATION

Every metric must first be normalized.

Example

Ping

Excellent

30 ms or below

100 Points

31-80

75 Points

81-150

50 Points

Above 150

0 Points

Do similar normalization for every KPI.

==========================================================

FINAL HEALTH SCORE

95-100

Excellent

Color

Green

Message

Infrastructure operating normally.

------------------------------------------

85-94

Good

Color

Blue

Message

Minor degradation detected.

------------------------------------------

70-84

Fair

Color

Orange

Message

Performance requires attention.

------------------------------------------

50-69

Poor

Color

Red

Message

Immediate investigation recommended.

------------------------------------------

Below 50

Critical

Color

Dark Red

Message

Executive attention required.

==========================================================

HEALTH SCORE COMPONENT

Display

Large Circular Progress

Percentage

Status

Trend

Previous Score

Recommendation

Affected Metrics

==========================================================

NETWORK QUALITY

Calculate

Excellent

Good

Fair

Poor

Based on

Ping

Jitter

Packet Loss

DNS

==========================================================

SLA ENGINE

Calculate

Today's SLA

Weekly SLA

Monthly SLA

Formula

Availability %

Display

Current SLA

Target SLA

Difference

==========================================================

AVAILABILITY

Calculate

Internet Availability

Power Availability

Formula

((Total Time - Downtime) / Total Time) * 100

==========================================================

DOWNTIME

Automatically calculate

Current Downtime

Today's Downtime

Weekly Downtime

Monthly Downtime

Longest Downtime

Shortest Downtime

Average Downtime

==========================================================

PERFORMANCE SCORE

Calculate

Download Performance

Upload Performance

Latency Performance

Bandwidth Performance

Overall Performance

==========================================================

TREND ENGINE

Calculate

Hourly Trend

Daily Trend

Weekly Trend

Monthly Trend

==========================================================

MOVING AVERAGE

Support

5 Samples

15 Samples

30 Samples

==========================================================

PEAK ANALYSIS

Calculate

Highest Download

Highest Upload

Lowest Ping

Highest Ping

Highest Packet Loss

Highest Bandwidth Usage

==========================================================

SMART ALERT ENGINE

Generate alerts automatically.

==========================================================

CRITICAL ALERTS

Internet Disconnected

Power OFF

Packet Loss above threshold

Bandwidth above threshold

Ping Critical

DNS Critical

Health Score below threshold

==========================================================

WARNING ALERTS

High Ping

Medium Packet Loss

High Jitter

High DNS

Bandwidth Busy

==========================================================

INFO ALERTS

Internet Restored

Power Restored

Health Improved

Bandwidth Normal

==========================================================

EVERY ALERT MUST CONTAIN

Unique ID

Timestamp

Severity

Category

Affected Metric

Current Value

Expected Value

Recommendation

Status

==========================================================

RECOMMENDATION ENGINE

Generate recommendations.

Example

High Ping

↓

Recommendation

Check ISP latency.

Verify router.

Check WAN utilization.

------------------------------------------

Packet Loss

↓

Recommendation

Inspect physical link.

Check ISP.

Verify cable.

------------------------------------------

High Bandwidth

↓

Recommendation

Review heavy traffic.

Identify bandwidth consumers.

==========================================================

EXECUTIVE INSIGHTS

Automatically generate.

Examples

Internet availability remained above target.

Packet loss increased by 12%.

Health score improved since yesterday.

Download speed dropped during peak hours.

Bandwidth utilization exceeded safe limits.

==========================================================

ANALYTICS

Display

Current

Previous

Difference

Trend

Percentage Change

==========================================================

PREDICTIVE ANALYTICS

Estimate

Potential SLA Risk

Future Health Trend

Network Stability

Risk Level

==========================================================

STATUS COLORS

Excellent

Green

Good

Blue

Fair

Orange

Poor

Red

Critical

Dark Red

==========================================================

BUSINESS RULES

Never display negative percentages.

Never divide by zero.

Ignore invalid rows.

Ignore incomplete timestamps.

Use thresholds from Excel.

Never hardcode business rules.

==========================================================

REAL-TIME RECALCULATION

Whenever one Excel cell changes

Recalculate only affected KPIs.

Update only affected widgets.

Recalculate Health Score.

Generate Alerts.

Broadcast updates.

==========================================================

SUCCESS CRITERIA

The application should not only display data.

It should explain data.

It should identify problems.

It should recommend actions.

It should help executives make decisions within seconds.

==========================================================
# ==========================================================
PART 8
ENTERPRISE AUTHENTICATION
ROLE BASED ACCESS CONTROL (RBAC)
==========================================================

ROLE

You are a Senior Security Architect.

Build authentication like enterprise software.

Do NOT build a normal login page.

This application will be used inside an organization.

There should be NO public registration.

==========================================================

AUTHENTICATION

Implement secure authentication.

Technology

JWT Authentication

Access Token

Refresh Token

Password Hashing using bcrypt

Secure Cookies (optional)

==========================================================

LOGIN ONLY

There should be NO

Register

Signup

Create Account

Social Login

Google Login

Facebook Login

GitHub Login

Microsoft Login

The first Admin account should be created manually.

Only Admin can create users.

==========================================================

LOGIN PAGE

Design a premium executive login page.

Inspired by

Apple

Stripe

Linear

Microsoft

Datadog

Features

Company Logo

Application Name

Welcome Message

Email

Password

Remember Me

Forgot Password

Login Button

Version Number

Animated Background

Glass Login Card

Light Mode

Dark Mode

Loading Animation

==========================================================

USER ROLES

Administrator

CEO

COO

CFO

CTO

CIO

CCO

CISO

HOD

NOC Manager

NOC Engineer

Support Engineer

Viewer

==========================================================

ROLE PERMISSIONS

Administrator

Full Access

Create Users

Edit Users

Delete Users

System Settings

Threshold Settings

Reports

Logs

Everything

-----------------------------------

CEO

Dashboard

Executive KPIs

Reports

Analytics

Read Only

-----------------------------------

COO

Dashboard

Operations

Analytics

Reports

Read Only

-----------------------------------

CFO

Dashboard

Reports

Availability

SLA

Business Summary

Read Only

-----------------------------------

CTO

Everything except User Management

-----------------------------------

NOC Manager

Dashboard

Alerts

Reports

History

Analytics

Settings (Limited)

-----------------------------------

NOC Engineer

Live Dashboard

Charts

Alerts

History

Logs

Read Only Settings

-----------------------------------

Viewer

Dashboard Only

==========================================================

SESSION MANAGEMENT

JWT Access Token

JWT Refresh Token

Auto Refresh Token

Session Timeout

Remember Me

Logout From Current Device

Logout From All Devices

==========================================================

PASSWORD POLICY

Minimum

12 Characters

Must Contain

Uppercase

Lowercase

Number

Special Character

Passwords must be hashed.

Never store plain text passwords.

==========================================================

FORGOT PASSWORD

Email Verification

OTP

Reset Password

Expire Token

==========================================================

SECURITY

Protect all APIs.

Protect WebSocket Connection.

Validate every JWT.

Role Verification on every request.

Never expose sensitive information.

==========================================================

USER PROFILE

Profile Picture

Full Name

Role

Email

Department

Phone (Optional)

Last Login

Last Activity

==========================================================

AUDIT LOG

Track

Login

Logout

Password Change

User Creation

User Deletion

Role Change

Settings Change

==========================================================

LOGIN EXPERIENCE

The login should feel premium.

Fast.

Elegant.

Professional.

No unnecessary fields.

Minimal design.

==========================================================

SUCCESS

Users should login securely.

Permissions should automatically change according to user role.

Unauthorized users must never access restricted pages or APIs.

==========================================================
END OF PART 8
==========================================================
SIMPLIFIED AUTHENTICATION
(DEMO VERSION)
==========================================================

This project is currently a prototype/demo for management review.

Do NOT implement a complex authentication system.

Do NOT implement:

- JWT
- OAuth
- Google Login
- Microsoft Login
- Email Verification
- OTP
- Password Reset
- Multi-Factor Authentication
- User Registration
- Role Management Database

Instead implement only a simple Login Screen.

==========================================================

LOGIN SCREEN

Create a premium executive login page.

Design should match the entire dashboard theme.

Use Apple-inspired Glass UI.

Support both

• Dark Mode
• Light Mode

==========================================================

LOGIN FORM

Fields

• Username
• Password

Button

• Login

Optional

• Remember Me

==========================================================

DEMO CREDENTIALS

Username: admin
Password: admin123

OR

Store credentials inside a simple configuration file.

No database required.

==========================================================

LOGIN FLOW

If credentials are correct

↓

Open Dashboard

If incorrect

↓

Show elegant error message

"Invalid Username or Password"

==========================================================

SESSION

Store login status locally.

User should remain logged in until Logout.

==========================================================

LOGOUT

Simple Logout button.

Clear session.

Return to Login Page.

==========================================================

PROTECTED ROUTES

Without login

↓

Dashboard cannot open.

After login

↓

All dashboard pages become accessible.

==========================================================

IMPORTANT

This is ONLY for demonstration.

The code structure should allow replacing this simple login with enterprise authentication later without changing the dashboard architecture.

Keep the authentication module isolated so JWT or Active Directory authentication can be added in the future.

==========================================================
END