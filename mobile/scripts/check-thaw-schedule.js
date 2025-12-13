#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const REDEMPTION_API_BASE_URL = 'https://mainnet.prod.gd.midnighttge.io';

/**
 * Get API headers to match browser requests
 */
const getApiHeaders = () => ({
  'accept': 'application/json, text/plain, */*',
  'accept-language': 'en-US,en;q=0.9',
  'cache-control': 'no-cache',
  'origin': 'https://redeem.midnight.gd',
  'referer': 'https://redeem.midnight.gd/',
  'user-agent':
    'Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36',
});

/**
 * Get thaw schedule for an address
 */
async function getThawSchedule(address) {
  const url = `${REDEMPTION_API_BASE_URL}/thaws/${encodeURIComponent(address)}/schedule`;
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: getApiHeaders(),
    });

    if (!response.ok) {
      if (response.status === 404 || response.status === 400) {
        return null; // Address not found or no allocations
      }
      if (response.status === 403) {
        throw new Error('API_ACCESS_FORBIDDEN');
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error.message === 'API_ACCESS_FORBIDDEN') {
      throw error;
    }
    // Network errors or other issues
    return null;
  }
}

/**
 * Get earliest redeemable thaw date (for sorting/prioritization)
 */
function getEarliestRedeemableDate(schedule) {
  if (!schedule || !schedule.thaws || schedule.thaws.length === 0) {
    return null;
  }

  const now = new Date();
  const redeemableThaws = schedule.thaws
    .filter((thaw) => {
      const thawDate = new Date(thaw.thawing_period_start);
      const hasStarted = thawDate <= now;
      const isRedeemable = thaw.status === 'redeemable';
      const isPendingRedeemable = thaw.status === 'upcoming' || thaw.status === 'queued';
      const isNotRedeemed = 
        thaw.status !== 'confirmed' &&
        thaw.status !== 'confirming' &&
        thaw.status !== 'submitted' &&
        thaw.status !== 'failed';
      
      return (isRedeemable || (hasStarted && isPendingRedeemable && isNotRedeemed));
    })
    .sort(
      (a, b) =>
        new Date(a.thawing_period_start).getTime() -
        new Date(b.thawing_period_start).getTime(),
    );

  return redeemableThaws.length > 0
    ? redeemableThaws[0].thawing_period_start
    : null;
}

/**
 * Get next thaw date from schedule (next upcoming thaw that hasn't started)
 */
function getNextThawDate(schedule) {
  if (!schedule || !schedule.thaws || schedule.thaws.length === 0) {
    return null;
  }

  const now = new Date();
  const upcomingThaws = schedule.thaws
    .filter((thaw) => {
      const thawDate = new Date(thaw.thawing_period_start);
      return thawDate > now && thaw.status === 'upcoming';
    })
    .sort(
      (a, b) =>
        new Date(a.thawing_period_start).getTime() -
        new Date(b.thawing_period_start).getTime(),
    );

  return upcomingThaws.length > 0
    ? upcomingThaws[0].thawing_period_start
    : null;
}

/**
 * Calculate total allocation amount
 */
function calculateTotalAllocation(schedule) {
  if (!schedule || !schedule.thaws) return 0;
  return schedule.thaws.reduce((sum, thaw) => sum + (thaw.amount || 0), 0);
}

/**
 * Calculate redeemable amount (thaws that have started)
 */
function calculateRedeemableAmount(schedule) {
  if (!schedule || !schedule.thaws) return 0;
  const now = new Date();
  return schedule.thaws.reduce((sum, thaw) => {
    const thawDate = new Date(thaw.thawing_period_start);
    const hasStarted = thawDate <= now;
    const isRedeemable = thaw.status === 'redeemable';
    const isPendingRedeemable = thaw.status === 'upcoming' || thaw.status === 'queued';
    const isNotRedeemed = 
      thaw.status !== 'confirmed' &&
      thaw.status !== 'confirming' &&
      thaw.status !== 'submitted' &&
      thaw.status !== 'failed';

    if (isRedeemable || (hasStarted && isPendingRedeemable && isNotRedeemed)) {
      return sum + (thaw.amount || 0);
    }
    return sum;
  }, 0);
}

/**
 * Format amount for display
 */
function formatAmount(amount) {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 6,
  }).format(amount);
}

/**
 * Process addresses and check thaw schedules
 */
async function checkAddresses(inputFile, outputFile, reportFile) {
  console.log(`Reading addresses from: ${inputFile}`);
  
  const fileContent = fs.readFileSync(inputFile, 'utf-8');
  const addresses = fileContent
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

  console.log(`Found ${addresses.length} addresses to check\n`);

  const results = [];
  let processed = 0;
  let errors = 0;

  // Process addresses with a delay to avoid rate limiting
  for (const address of addresses) {
    processed++;
    process.stdout.write(`[${processed}/${addresses.length}] Checking ${address}... `);

    try {
      const schedule = await getThawSchedule(address);
      
      if (schedule === null) {
        console.log('No allocations');
        results.push({
          address,
          eligible: false,
          nextThawDate: null,
          schedule: null,
        });
      } else {
        const earliestRedeemable = getEarliestRedeemableDate(schedule);
        const nextThawDate = getNextThawDate(schedule);
        const status = earliestRedeemable 
          ? `Redeemable now (next: ${nextThawDate || 'N/A'})` 
          : (nextThawDate ? `Next thaw: ${nextThawDate}` : 'All thaws completed');
        console.log(status);
        
        results.push({
          address,
          eligible: true,
          nextThawDate,
          earliestRedeemableDate: earliestRedeemable,
          schedule,
        });
      }
    } catch (error) {
      errors++;
      console.log(`Error: ${error.message}`);
      results.push({
        address,
        eligible: false,
        nextThawDate: null,
        error: error.message,
        schedule: null,
      });
    }

    // Small delay to avoid rate limiting (100ms between requests)
    if (processed < addresses.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  console.log(`\n\nProcessing complete!`);
  console.log(`- Processed: ${processed}`);
  console.log(`- Errors: ${errors}`);
  console.log(`- Eligible: ${results.filter(r => r.eligible).length}`);

  // Sort by earliest redeemable date first (prioritize addresses with redeemable thaws),
  // then by next thaw date (nulls go to the end)
  results.sort((a, b) => {
    // Prioritize addresses with redeemable thaws
    const aHasRedeemable = a.earliestRedeemableDate !== null;
    const bHasRedeemable = b.earliestRedeemableDate !== null;
    
    if (aHasRedeemable && !bHasRedeemable) return -1;
    if (!aHasRedeemable && bHasRedeemable) return 1;
    
    // If both have redeemable, sort by earliest redeemable date
    if (aHasRedeemable && bHasRedeemable) {
      return new Date(a.earliestRedeemableDate).getTime() - new Date(b.earliestRedeemableDate).getTime();
    }
    
    // Otherwise sort by next thaw date
    if (a.nextThawDate === null && b.nextThawDate === null) return 0;
    if (a.nextThawDate === null) return 1;
    if (b.nextThawDate === null) return -1;
    return new Date(a.nextThawDate).getTime() - new Date(b.nextThawDate).getTime();
  });

  // Write summary results to output file
  console.log(`\nWriting summary to: ${outputFile}`);
  
  const outputLines = [];
  outputLines.push('# Addresses sorted by next thaw schedule');
  outputLines.push(`# Generated: ${new Date().toISOString()}`);
  outputLines.push(`# Total addresses: ${addresses.length}`);
  outputLines.push(`# Eligible addresses: ${results.filter(r => r.eligible).length}`);
  outputLines.push('');
  outputLines.push('Address | Eligible | Next Thaw Date | Total Thaws');
  outputLines.push('--- | --- | --- | ---');

  for (const result of results) {
    const nextThawStr = result.nextThawDate 
      ? new Date(result.nextThawDate).toISOString()
      : 'N/A';
    const totalThaws = result.schedule?.thaws?.length || 0;
    const eligibleStr = result.eligible ? 'Yes' : 'No';
    
    outputLines.push(`${result.address} | ${eligibleStr} | ${nextThawStr} | ${totalThaws}`);
  }

  // Also create a simple address-only file sorted by thaw date
  const addressOnlyLines = results
    .filter(r => r.eligible && r.nextThawDate !== null)
    .map(r => r.address);

  const addressOnlyFile = outputFile.replace(/\.(txt|md)$/, '_addresses_only.txt');
  fs.writeFileSync(addressOnlyFile, addressOnlyLines.join('\n') + '\n');
  console.log(`Also created address-only file: ${addressOnlyFile}`);

  fs.writeFileSync(outputFile, outputLines.join('\n') + '\n');

  // Write detailed report
  console.log(`Writing detailed report to: ${reportFile}`);
  writeDetailedReport(results, reportFile);
  console.log('Done!');
}

/**
 * Write detailed report with all thaw information
 */
function writeDetailedReport(results, reportFile) {
  const now = new Date();
  const eligibleResults = results.filter(r => r.eligible && r.schedule);
  
  const reportLines = [];
  reportLines.push('# Detailed Thaw Schedule Report');
  reportLines.push(`# Generated: ${now.toISOString()}`);
  reportLines.push(`# Total addresses checked: ${results.length}`);
  reportLines.push(`# Eligible addresses: ${eligibleResults.length}`);
  reportLines.push(`# Non-eligible addresses: ${results.length - eligibleResults.length}`);
  reportLines.push('');
  
  // Summary statistics
  const totalAllocation = eligibleResults.reduce((sum, r) => 
    sum + calculateTotalAllocation(r.schedule), 0);
  const totalRedeemable = eligibleResults.reduce((sum, r) => 
    sum + calculateRedeemableAmount(r.schedule), 0);
  const totalRemaining = totalAllocation - totalRedeemable;
  
  reportLines.push('## Summary Statistics');
  reportLines.push('');
  reportLines.push(`- **Total Allocation**: ${formatAmount(totalAllocation)} NIGHT`);
  reportLines.push(`- **Currently Redeemable**: ${formatAmount(totalRedeemable)} NIGHT`);
  reportLines.push(`- **Remaining to Redeem**: ${formatAmount(totalRemaining)} NIGHT`);
  reportLines.push('');
  
  // Group by earliest redeemable date first, then by next thaw date
  const byThawDate = {};
  eligibleResults.forEach(result => {
    // Prioritize grouping by redeemable date if available
    const dateKey = result.earliestRedeemableDate
      ? `redeemable-${new Date(result.earliestRedeemableDate).toISOString().split('T')[0]}`
      : (result.nextThawDate 
          ? new Date(result.nextThawDate).toISOString().split('T')[0]
          : 'completed');
    if (!byThawDate[dateKey]) {
      byThawDate[dateKey] = [];
    }
    byThawDate[dateKey].push(result);
  });
  
  reportLines.push('## Addresses by Thaw Schedule');
  reportLines.push('');
  
  const sortedDates = Object.keys(byThawDate).sort((a, b) => {
    // "redeemable-" dates come first
    if (a.startsWith('redeemable-') && !b.startsWith('redeemable-')) return -1;
    if (!a.startsWith('redeemable-') && b.startsWith('redeemable-')) return 1;
    if (a === 'completed') return 1;
    if (b === 'completed') return -1;
    // Remove "redeemable-" prefix for comparison
    const aDate = a.replace('redeemable-', '');
    const bDate = b.replace('redeemable-', '');
    return aDate.localeCompare(bDate);
  });
  
  for (const dateKey of sortedDates) {
    const dateResults = byThawDate[dateKey];
    let dateLabel;
    if (dateKey === 'completed') {
      dateLabel = 'All Thaws Completed';
    } else if (dateKey.startsWith('redeemable-')) {
      const actualDate = dateKey.replace('redeemable-', '');
      dateLabel = `Currently Redeemable (Started: ${new Date(actualDate).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })})`;
    } else {
      dateLabel = `Next Thaw: ${new Date(dateKey).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })}`;
    }
    
    reportLines.push(`### ${dateLabel} (${dateResults.length} addresses)`);
    reportLines.push('');
    
    for (const result of dateResults) {
      const schedule = result.schedule;
      const totalAlloc = calculateTotalAllocation(schedule);
      const redeemable = calculateRedeemableAmount(schedule);
      const remaining = totalAlloc - redeemable;
      
      reportLines.push(`#### ${result.address}`);
      reportLines.push('');
      reportLines.push(`- **Total Allocation**: ${formatAmount(totalAlloc)} NIGHT`);
      reportLines.push(`- **Redeemable Now**: ${formatAmount(redeemable)} NIGHT`);
      reportLines.push(`- **Remaining**: ${formatAmount(remaining)} NIGHT`);
      reportLines.push(`- **Number of Thaws**: ${schedule.thaws.length}`);
      if (result.earliestRedeemableDate) {
        reportLines.push(`- **Earliest Redeemable Date**: ${new Date(result.earliestRedeemableDate).toISOString()} ⚠️ **AVAILABLE NOW**`);
      }
      reportLines.push(`- **Next Upcoming Thaw Date**: ${result.nextThawDate ? new Date(result.nextThawDate).toISOString() : 'N/A'}`);
      reportLines.push('');
      reportLines.push('**Thaw Schedule:**');
      reportLines.push('');
      reportLines.push('| # | Date | Amount | Status |');
      reportLines.push('|---|------|--------|--------|');
      
      schedule.thaws.forEach((thaw, index) => {
        const thawDate = new Date(thaw.thawing_period_start);
        const dateStr = thawDate.toISOString();
        const amount = formatAmount(thaw.amount);
        const status = thaw.status;
        reportLines.push(`| ${index + 1} | ${dateStr} | ${amount} NIGHT | ${status} |`);
      });
      
      reportLines.push('');
      reportLines.push('---');
      reportLines.push('');
    }
  }
  
  // Non-eligible addresses
  const nonEligible = results.filter(r => !r.eligible);
  if (nonEligible.length > 0) {
    reportLines.push('## Non-Eligible Addresses');
    reportLines.push('');
    reportLines.push(`Total: ${nonEligible.length}`);
    reportLines.push('');
    reportLines.push('| Address | Reason |');
    reportLines.push('|---------|--------|');
    
    nonEligible.forEach(result => {
      const reason = result.error || 'No allocations found';
      reportLines.push(`| ${result.address} | ${reason} |`);
    });
    reportLines.push('');
  }
  
  fs.writeFileSync(reportFile, reportLines.join('\n') + '\n');
}

// Main execution
const inputFile = process.argv[2] || '/home/jorbuedo/Downloads/fixed';
const outputDir = path.dirname(inputFile);
const outputFile = process.argv[3] || path.join(outputDir, 'thaw_schedule_results.md');
const reportFile = process.argv[4] || path.join(outputDir, 'thaw_schedule_detailed_report.md');

if (!fs.existsSync(inputFile)) {
  console.error(`Error: Input file not found: ${inputFile}`);
  process.exit(1);
}

checkAddresses(inputFile, outputFile, reportFile).catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

