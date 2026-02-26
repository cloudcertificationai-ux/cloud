import { Metadata } from 'next';
import HeroSection from '@/components/HeroSection';
import TrustIndicators from '@/components/TrustIndicators';

export const metadata: Metadata = {
  title: 'Hero Section Demo - Anywheredoor',
  description: 'Demo page showcasing the new Simplilearn-inspired hero section and trust indicators',
};

export default function HeroDemo() {
  // Custom hero props with Simplilearn-inspired messaging
  const heroProps = {
    headline: "Be a Leader in Your Field",
    subheadline: "Master in-demand skills with industry-recognized certifications and hands-on projects that prepare you for career advancement in AI, Data Science, and Cloud Computing.",
    primaryCTA: {
      text: "Explore Programs",
      href: "/courses"
    },
    secondaryCTA: {
      text: "Watch Success Stories",
      href: "#"
    },
    successMetrics: [
      {
        id: "1",
        value: "50K+",
        label: "Learners",
        iconName: "users" as const,
        description: "Active students worldwide"
      },
      {
        id: "2", 
        value: "92%",
        label: "Job Placement",
        iconName: "trophy" as const,
        description: "Within 6 months"
      },
      {
        id: "3",
        value: "65%",
        label: "Salary Increase",
        iconName: "chart" as const,
        description: "Average career boost"
      },
      {
        id: "4",
        value: "4.7★",
        label: "Rating",
        iconName: "academic" as const,
        description: "From 15K+ reviews"
      }
    ]
  };

  return (
    <div className="min-h-screen bg-white">
      {/* New Simplilearn-inspired Hero Section */}
      <HeroSection {...heroProps} />
      
      {/* Trust Indicators Section */}
      <TrustIndicators 
        metrics={{
          totalStudents: 50000,
          averageSalaryIncrease: '65%',
          jobPlacementRate: 92,
          courseCompletionRate: 85,
          averageRating: 4.7,
          industryPartners: ['Google', 'Microsoft', 'Amazon', 'Meta'],
        }}
      />
      
      {/* Demo Information */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Simplilearn-Inspired Design Components
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            This demo page showcases the new hero section and trust indicators components 
            designed to match Simplilearn's professional, enterprise-grade UI patterns.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Hero Section Features</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Professional gradient background with blue theme</li>
                <li>• "Be a Leader in Your Field" messaging</li>
                <li>• Prominent CTA buttons with hover animations</li>
                <li>• Success metrics display with icons</li>
                <li>• Trust indicators preview</li>
                <li>• Video modal integration</li>
              </ul>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Trust Indicators Features</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Partner logo carousel with categories</li>
                <li>• Industry certification badges</li>
                <li>• Real-time success metrics</li>
                <li>• University collaboration highlights</li>
                <li>• Fortune 500 company endorsements</li>
                <li>• Auto-rotating carousel functionality</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}