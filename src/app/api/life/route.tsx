import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const birthdayStr = searchParams.get('birthday');
    const widthStr = searchParams.get('width') || '1170';
    const heightStr = searchParams.get('height') || '2532';
    const lifeStr = searchParams.get('life') || '80';

    if (!birthdayStr) {
      return new Response('Missing "birthday" query parameter (format: YYYY-MM-DD)', { status: 400 });
    }

    const width = parseInt(widthStr, 10);
    const height = parseInt(heightStr, 10);
    const lifeExpectancy = parseInt(lifeStr, 10);

    // --- Exact Time Math (GMT+7 Asia/Bangkok) ---
    const birthday = new Date(birthdayStr);
    const birthYear = birthday.getUTCFullYear();
    const birthMonth = birthday.getUTCMonth();
    const birthDate = birthday.getUTCDate();

    const realNow = Date.now();
    const bangkokTimeMs = realNow + (7 * 60 * 60 * 1000);
    const now = new Date(bangkokTimeMs);
    const nowYear = now.getUTCFullYear();
    const nowMonth = now.getUTCMonth();
    const nowDate = now.getUTCDate();

    const msPerDay = 1000 * 60 * 60 * 24;

    const daysLived = Math.floor((bangkokTimeMs - birthday.getTime()) / msPerDay);
    const totalDaysInLife = lifeExpectancy * 365.25;
    const daysLeft = Math.max(0, Math.floor(totalDaysInLife - daysLived));

    let age = nowYear - birthYear;
    if (nowMonth < birthMonth || (nowMonth === birthMonth && nowDate < birthDate)) {
      age--;
    }

    // Is current year leap year?
    const isLeapYear = (year: number) => {
      return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
    };
    const daysInCurrentYear = isLeapYear(nowYear) ? 366 : 365;

    const startOfYearMs = Date.UTC(nowYear, 0, 1);
    const daysPassedThisYear = Math.floor((bangkokTimeMs - startOfYearMs) / msPerDay);
    const currentOngoingDayIndex = daysPassedThisYear;
    const daysLeftThisYear = Math.max(0, daysInCurrentYear - currentOngoingDayIndex - 1);

    // Theme setup
    const accentColor = '#ffffff';
    const dimColor = '#333333';
    const bgColor = '#111111';
    const orangeColor = '#FFA500';
    const greenColor = '#4ADE80';

    // --- SVG Grid 1: Lifetime ---
    const totalCells = 40;
    const cols1 = 10;
    const size1 = 48;
    const gap1 = 16;
    const lifetimeRows = Math.ceil(totalCells / cols1);
    const grid1Width = cols1 * size1 + (cols1 - 1) * gap1; // 10*48 + 9*16 = 624
    const grid1Height = lifetimeRows * size1 + (lifetimeRows - 1) * gap1; // 4*48 + 3*16 = 240

    const lifetimeSvgElements = Array.from({ length: totalCells }).map((_, i) => {
      const col = i % cols1;
      const row = Math.floor(i / cols1);
      const x = col * (size1 + gap1);
      const y = row * (size1 + gap1);
      
      const leftHalfIndex = i * 2;
      const rightHalfIndex = i * 2 + 1;

      const getColors = (halfIndex: number) => {
        if (halfIndex < age) return { fill: accentColor, stroke: 'transparent', strokeWidth: '0' };
        if (halfIndex === age) return { fill: orangeColor, stroke: 'transparent', strokeWidth: '0' };
        return { fill: 'transparent', stroke: dimColor, strokeWidth: '2' };
      };

      const leftStyle = getColors(leftHalfIndex);
      const rightStyle = getColors(rightHalfIndex);

      return (
        <g key={`cell-${i}`} transform={`translate(${x}, ${y})`}>
          <path 
            d="M 24 0 A 24 24 0 0 0 24 48 Z" 
            fill={leftStyle.fill} 
            stroke={leftStyle.stroke} 
            strokeWidth={leftStyle.strokeWidth}
          />
          <path 
            d="M 24 0 A 24 24 0 0 1 24 48 Z" 
            fill={rightStyle.fill} 
            stroke={rightStyle.stroke} 
            strokeWidth={rightStyle.strokeWidth}
          />
        </g>
      );
    });

    // --- SVG Grid 2: Current Year ---
    const cols2 = 15;
    const size2 = 20;
    const gap2 = 12;
    const yearRows = Math.ceil(daysInCurrentYear / cols2);
    const grid2Width = cols2 * size2 + (cols2 - 1) * gap2; // 15*20 + 14*12 = 468
    const grid2Height = yearRows * size2 + (yearRows - 1) * gap2;

    const daysSvgElements = Array.from({ length: daysInCurrentYear }).map((_, i) => {
      const col = i % cols2;
      const row = Math.floor(i / cols2);
      const x = col * (size2 + gap2);
      const y = row * (size2 + gap2);

      let fill = 'transparent';
      let stroke = dimColor;
      let strokeWidth = "2";

      if (i < currentOngoingDayIndex) {
        fill = accentColor;
        stroke = 'transparent';
        strokeWidth = "0";
      } else if (i === currentOngoingDayIndex) {
        fill = orangeColor;
        stroke = 'transparent';
        strokeWidth = "0";
      }

      return (
        <circle 
          key={`day-${i}`} 
          cx={x + size2 / 2} 
          cy={y + size2 / 2} 
          r={size2 / 2} 
          fill={fill} 
          stroke={stroke} 
          strokeWidth={strokeWidth} 
        />
      );
    });

    return new ImageResponse(
      (
        <div style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          backgroundColor: bgColor,
          fontFamily: 'sans-serif',
          position: 'relative',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {/* Strict Bounding Box */}
          <div style={{ position: 'absolute', top: 1000, left: 60, width: 1050, height: 1150, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start' }}>

            {/* --- Block 1: Lifetime Part --- */}
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{
                display: 'flex',
                fontSize: 40,
                color: accentColor,
                marginBottom: '40px',
                fontWeight: 600,
                letterSpacing: '-1px',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                You have &nbsp;<span style={{ color: orangeColor }}>{daysLeft.toLocaleString()}</span>&nbsp; days left
                {/* Battery Icon */}
                <div style={{ display: 'flex', alignItems: 'center', marginLeft: '24px' }}>
                  <div style={{
                    display: 'flex',
                    width: '64px',
                    height: '28px',
                    border: `2px solid ${accentColor}`,
                    borderRadius: '5px',
                    padding: '3px'
                  }}>
                    <div style={{
                      display: 'flex',
                      width: `${Math.max(0, Math.min(100, (daysLeft / totalDaysInLife) * 100))}%`,
                      height: '100%',
                      backgroundColor: orangeColor,
                      borderRadius: '2px'
                    }} />
                  </div>
                  <div style={{
                    display: 'flex',
                    width: '5px',
                    height: '14px',
                    backgroundColor: accentColor,
                    borderTopRightRadius: '4px',
                    borderBottomRightRadius: '4px'
                  }} />
                </div>
              </div>

              {/* Single SVG for Lifetime Grid */}
              <div style={{ display: 'flex' }}>
                <svg width={grid1Width} height={grid1Height} viewBox={`0 0 ${grid1Width} ${grid1Height}`}>
                  {lifetimeSvgElements}
                </svg>
              </div>
            </div>

            {/* --- Block 2: Quote Component --- */}
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#ffffff', gap: '8px', textAlign: 'center', marginTop: '40px', marginBottom: '40px' }}>
                <div style={{ display: 'flex', fontSize: 40, fontWeight: 600 }}>
                  <span style={{ color: greenColor }}>Re</span>st &nbsp;|&nbsp; <span style={{ color: greenColor }}>Re</span>set &nbsp;|&nbsp; <span style={{ color: greenColor }}>Re</span>start &nbsp;|&nbsp; <span style={{ color: greenColor }}>Re</span>focus
                </div>
                <div style={{ display: 'flex', fontSize: 24, fontWeight: 400 }}>
                  as &nbsp;<span style={{ color: greenColor }}>many times</span>&nbsp; as you need to.
                </div>
              </div>
            </div>

            {/* --- Block 3: Current Year Part --- */}
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{
                display: 'flex',
                fontSize: 28,
                color: accentColor,
                marginBottom: '32px',
                fontWeight: 500,
                letterSpacing: '-0.5px',
                justifyContent: 'center'
              }}>
                You have &nbsp;<span style={{ color: orangeColor }}>{daysLeftThisYear.toLocaleString()}</span>&nbsp; days left in this year
              </div>

              {/* Single SVG for Current Year Grid */}
              <div style={{ display: 'flex' }}>
                <svg width={grid2Width} height={grid2Height} viewBox={`0 0 ${grid2Width} ${grid2Height}`}>
                  {daysSvgElements}
                </svg>
              </div>
            </div>

          </div>
        </div>
      ),
      {
        width,
        height,
        headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate', 'Pragma': 'no-cache', 'Expires': '0' }
      }
    );
  } catch (e) {
    return new Response('Internal Server Error', { status: 500 });
  }
}