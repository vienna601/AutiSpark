import React, { useState, useEffect } from "react";
import {
  Book,
  Brain,
  MessageCircle,
  ChevronRight,
  Star,
  Trophy,
  Lightbulb,
  ArrowLeft,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function ReadingPage() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#a8c4c3', 
      padding: '20px',
      fontFamily: 'Comfortaa, cursive'
    }}>
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '30px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{
              width: '61px',
              height: '62px',
              borderRadius: '20px',
              border: '5px solid rgba(246, 233, 226, 0.85)',
              background: '#c9dcf1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              📚
            </div>
            <h1 style={{
              color: '#524944',
              fontSize: '25px',
              fontWeight: '700',
              margin: 0
            }}>
              Reading Comprehension
            </h1>
          </div>
          
          <Link 
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              color: '#524944',
              fontSize: '20px',
              fontWeight: '700',
              textDecoration: 'none',
              padding: '10px 20px',
              borderRadius: '10px',
              transition: 'background-color 0.2s'
            }}
          >
            <ArrowLeft size={20} />
            Go Back Home
          </Link>
        </div>

        {/* Content */}
        <div style={{
          background: '#c9dcf1',
          borderRadius: '20px',
          padding: '40px',
          textAlign: 'center'
        }}>
          <h2 style={{
            color: '#524944',
            fontSize: '28px',
            marginBottom: '20px'
          }}>
            Reading Practice Coming Soon!
          </h2>
          <p style={{
            color: '#524944',
            fontSize: '18px',
            lineHeight: '1.6'
          }}>
            We're working on creating interactive reading stories and comprehension exercises 
            designed specifically for children with autism. This feature will include:
          </p>
          <ul style={{
            color: '#524944',
            fontSize: '16px',
            textAlign: 'left',
            maxWidth: '600px',
            margin: '20px auto',
            lineHeight: '1.8'
          }}>
            <li>Interactive stories with different difficulty levels</li>
            <li>Comprehension questions and activities</li>
            <li>Visual aids and illustrations</li>
            <li>Progress tracking and achievements</li>
            <li>AI-powered reading assistance</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
