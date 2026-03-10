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

    // --- Section 1: Lifetime (Grid exactly 4x10 = 40 cells = 80 semi-circles) ---
    const rowsGrid1 = 4;
    const colsGrid1 = 10;
    const yearsRows = Array.from({ length: rowsGrid1 }).map((_, r) => {
      return Array.from({ length: colsGrid1 }).map((_, c) => {
        const cellIndex = r * colsGrid1 + c; // 0 to 39
        const leftHalfIndex = cellIndex * 2; // e.g. 0
        const rightHalfIndex = cellIndex * 2 + 1; // e.g. 1
        
        const getStatus = (halfIndex: number) => {
          if (halfIndex < age) return 'past';
          if (halfIndex === age) return 'current';
          return 'future';
        };

        return {
          left: getStatus(leftHalfIndex),
          right: getStatus(rightHalfIndex),
        };
      });
    });

    // --- Section 2: Current Year (Days Grid) ---
    // 1 row = 15 circles
    const colsGrid2 = 15;
    const rowsGrid2 = Math.ceil(daysInCurrentYear / colsGrid2);
    const daysRows = Array.from({ length: rowsGrid2 }).map((_, r) => {
      return Array.from({ length: colsGrid2 }).map((_, c) => {
        const dotIndex = r * colsGrid2 + c;
        if (dotIndex >= daysInCurrentYear) return { status: 'hidden' };
        
        let status = 'future';
        if (dotIndex < currentOngoingDayIndex) status = 'past';
        else if (dotIndex === currentOngoingDayIndex) status = 'current';

        return { status };
      });
    });

    // Theme setup
    const accentColor = '#ffffff';
    const dimColor = '#333333';
    const bgColor = '#111111';
    const orangeColor = '#FFA500';

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
          {/* Strict Bounding Box (Y-axis: 1000 to 2000) Left: 60, Width: 1050 */}
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
              
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '16px', // Identical vertical gap for Grid 1
                alignItems: 'center' 
              }}>
                {yearsRows.map((row, r) => (
                  <div key={r} style={{ 
                    display: 'flex', 
                    gap: '16px', // Identical horizontal gap for Grid 1
                    justifyContent: 'center' 
                  }}>
                    {row.map((cell, c) => (
                      <div key={c} style={{ display: 'flex', width: '48px', height: '48px' }}>
                        {/* Left Semi-circle */}
                        <div style={{
                          display: 'flex',
                          width: '24px', height: '48px',
                          backgroundColor: cell.left === 'current' ? orangeColor : (cell.left === 'past' ? accentColor : 'transparent'),
                          borderTop: `2px solid ${cell.left === 'future' ? dimColor : 'transparent'}`,
                          borderBottom: `2px solid ${cell.left === 'future' ? dimColor : 'transparent'}`,
                          borderLeft: `2px solid ${cell.left === 'future' ? dimColor : 'transparent'}`,
                          borderRight: `1px solid ${cell.left === 'future' ? dimColor : 'transparent'}`,
                          borderTopLeftRadius: '24px',
                          borderBottomLeftRadius: '24px'
                        }} />
                        {/* Right Semi-circle */}
                        <div style={{
                          display: 'flex',
                          width: '24px', height: '48px',
                          backgroundColor: cell.right === 'current' ? orangeColor : (cell.right === 'past' ? accentColor : 'transparent'),
                          borderTop: `2px solid ${cell.right === 'future' ? dimColor : 'transparent'}`,
                          borderBottom: `2px solid ${cell.right === 'future' ? dimColor : 'transparent'}`,
                          borderRight: `2px solid ${cell.right === 'future' ? dimColor : 'transparent'}`,
                          borderLeft: `1px solid ${cell.right === 'future' ? dimColor : 'transparent'}`,
                          borderTopRightRadius: '24px',
                          borderBottomRightRadius: '24px'
                        }} />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* --- Block 2: Quote Component --- */}
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#ffffff', gap: '8px', textAlign: 'center', marginTop: '80px', marginBottom: '80px' }}>
                <div style={{ display: 'flex', fontSize: 24, fontWeight: 600 }}>
                  <span style={{ color: '#4ADE80' }}>Re</span>st | <span style={{ color: '#4ADE80' }}>Re</span>set | <span style={{ color: '#4ADE80' }}>Re</span>start | <span style={{ color: '#4ADE80' }}>Re</span>focus
                </div>
                <div style={{ display: 'flex', fontSize: 20, fontWeight: 400 }}>
                  as &nbsp;<span style={{ color: '#4ADE80' }}>many times</span>&nbsp; as you need to.
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

              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '12px', // Identical vertical gap for Grid 2
                alignItems: 'center' 
              }}>
                {daysRows.map((row, r) => (
                  <div key={r} style={{ 
                    display: 'flex', 
                    gap: '12px', // Identical horizontal gap for Grid 2
                    justifyContent: 'center' 
                  }}>
                    {row.map((circle, c) => (
                       <div key={c} style={{
                         display: 'flex',
                         width: '20px',   // Medium-large circles
                         height: '20px', 
                         borderRadius: '50%',
                         backgroundColor: circle.status === 'current' ? orangeColor : (circle.status === 'past' ? accentColor : 'transparent'),
                         border: circle.status === 'future' ? `2px solid ${dimColor}` : 'none',
                         opacity: circle.status === 'hidden' ? 0 : 1
                       }} />
                    ))}
                  </div>
                ))}
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
