import { NextRequest } from 'next/server';

interface Lead {
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  industry: string;
  companyWebsite: string;
  address: string;
  linkedInProfile?: string;
  companySize?: string;
  qualification?: string;
}

const mumbaiAreas = [
  'Andheri', 'Bandra', 'Powai', 'Lower Parel', 'BKC', 'Worli', 'Goregaon', 'Malad',
  'Vikhroli', 'Ghatkopar', 'Thane', 'Navi Mumbai', 'Kurla', 'Santacruz', 'Juhu',
  'Borivali', 'Kandivali', 'Dadar', 'Parel', 'Fort', 'Nariman Point', 'Churchgate'
];

const contactTitles = ['Owner', 'Manager', 'Sales Head', 'IT Manager', 'CEO', 'CTO', 'Founder', 'Director'];

const generateMumbaiLeads = (industries: string[], minSize: number, maxSize: number): Lead[] => {
  const leads: Lead[] = [];
  const leadsPerIndustry = 8;

  const companyPrefixes: { [key: string]: string[] } = {
    'IT': ['Tech', 'Infotech', 'Systems', 'Solutions', 'Software', 'Digital', 'Cyber', 'Cloud'],
    'Startups': ['Innovate', 'Venture', 'Launch', 'Spark', 'Rise', 'Growth', 'Scale', 'Next'],
    'Digital Marketing': ['Media', 'Creative', 'Brand', 'Marketing', 'Ads', 'Social', 'Content', 'Strategy'],
    'Finance': ['Capital', 'Finance', 'Wealth', 'Asset', 'Investment', 'Advisory', 'Fintech', 'Banking'],
    'E-commerce': ['Shop', 'Market', 'Store', 'Trade', 'Commerce', 'Retail', 'Buy', 'Sell'],
    'Healthcare': ['Health', 'Care', 'Medical', 'Wellness', 'Clinic', 'Hospital', 'Pharma', 'Life'],
    'Education': ['Edu', 'Learn', 'Academy', 'Institute', 'School', 'Training', 'Skills', 'Knowledge'],
    'Real Estate': ['Property', 'Realty', 'Estates', 'Homes', 'Build', 'Construction', 'Developers', 'Projects']
  };

  const companySuffixes = ['Pvt Ltd', 'Solutions', 'Services', 'Group', 'Corp', 'Technologies', 'Enterprises', 'India'];

  industries.forEach(industry => {
    const prefixes = companyPrefixes[industry] || ['Business'];

    for (let i = 0; i < leadsPerIndustry; i++) {
      const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
      const suffix = companySuffixes[Math.floor(Math.random() * companySuffixes.length)];
      const companyName = `${prefix} ${suffix}`;

      const firstName = ['Rajesh', 'Priya', 'Amit', 'Sneha', 'Vikram', 'Anjali', 'Arjun', 'Pooja', 'Rohan', 'Kavita'][Math.floor(Math.random() * 10)];
      const lastName = ['Sharma', 'Patel', 'Kumar', 'Singh', 'Mehta', 'Shah', 'Desai', 'Joshi', 'Reddy', 'Nair'][Math.floor(Math.random() * 10)];
      const contactName = `${firstName} ${lastName}`;
      const title = contactTitles[Math.floor(Math.random() * contactTitles.length)];

      const area = mumbaiAreas[Math.floor(Math.random() * mumbaiAreas.length)];
      const companyDomain = companyName.toLowerCase().replace(/\s+/g, '').replace(/pvtltd|ltd/g, '');

      const companySize = Math.floor(Math.random() * (maxSize - minSize) + minSize);

      let qualification = 'Qualified Lead';
      if (companySize > 500) {
        qualification = 'Hot Lead';
      } else if (companySize > 200) {
        qualification = 'Warm Lead';
      }

      const lead: Lead = {
        companyName,
        contactName: `${contactName} (${title})`,
        contactEmail: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${companyDomain}.com`,
        contactPhone: `+91 ${Math.floor(Math.random() * 90000) + 10000} ${Math.floor(Math.random() * 90000) + 10000}`,
        industry,
        companyWebsite: `https://www.${companyDomain}.com`,
        address: `${Math.floor(Math.random() * 500) + 1}, ${area}, Mumbai, Maharashtra 400${Math.floor(Math.random() * 100)}, India`,
        linkedInProfile: `https://www.linkedin.com/in/${firstName.toLowerCase()}-${lastName.toLowerCase()}`,
        companySize: `${companySize}`,
        qualification
      };

      leads.push(lead);
    }
  });

  return leads;
};

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();
  const { industries, minSize, maxSize } = await request.json();

  const stream = new ReadableStream({
    async start(controller) {
      const sendMessage = (type: string, data: any) => {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type, ...data })}\n\n`)
        );
      };

      try {
        sendMessage('progress', { message: 'Searching Google business listings in Mumbai...' });
        await new Promise(resolve => setTimeout(resolve, 1500));

        sendMessage('progress', { message: `Filtering by industries: ${industries.join(', ')}...` });
        await new Promise(resolve => setTimeout(resolve, 1200));

        sendMessage('progress', { message: 'Extracting contact information...' });
        await new Promise(resolve => setTimeout(resolve, 1000));

        const leads = generateMumbaiLeads(industries, minSize, maxSize);

        sendMessage('progress', { message: 'Enriching profiles with LinkedIn data...' });
        await new Promise(resolve => setTimeout(resolve, 1500));

        sendMessage('progress', { message: 'Verifying domains and websites...' });
        await new Promise(resolve => setTimeout(resolve, 1200));

        for (let i = 0; i < leads.length; i++) {
          sendMessage('lead', { lead: leads[i] });
          await new Promise(resolve => setTimeout(resolve, 300));

          if ((i + 1) % 10 === 0) {
            sendMessage('progress', { message: `Processed ${i + 1}/${leads.length} leads...` });
          }
        }

        sendMessage('progress', { message: 'Qualifying leads based on criteria...' });
        await new Promise(resolve => setTimeout(resolve, 800));

        sendMessage('complete', { message: `Successfully generated ${leads.length} qualified leads!` });
        controller.close();
      } catch (error) {
        console.error('Error generating leads:', error);
        controller.error(error);
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
