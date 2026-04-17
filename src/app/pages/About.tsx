import { Navigation } from "../components/Navigation";
import { Mail, MapPin, Calendar } from "lucide-react";

const authorImage = "https://images.unsplash.com/photo-1545379537-5d1275c630fe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaXZlJTIwY29sbGVnZSUyMHN0dWRlbnRzJTIwdGVhbSUyMHdvcmtpbmclMjB0b2dldGhlcnxlbnwxfHx8fDE3NzM5MTI5NjN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";

export default function About() {
  return (
    <div className="min-h-screen bg-[#f5f1e8]">
      <Navigation />
      
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="border-2 border-orange-900/20 rounded-3xl p-8 md:p-12 bg-white">
          <h1 className="text-4xl text-orange-900 mb-8 text-center">Meet the Team!</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Author Image */}
            <div className="border-2 border-orange-900/20 rounded-2xl overflow-hidden">
              <img 
                src={authorImage} 
                alt="Chef portrait" 
                className="w-full h-full object-cover aspect-square"
              />
            </div>

            {/* Author Info */}
            <div className="flex flex-col justify-center space-y-6">
              <div>
                <h2 className="text-3xl text-orange-900 mb-2">Team Name</h2>
                <p className="text-orange-600">Developer Team</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-orange-900/70">
                  <MapPin className="w-5 h-5 text-orange-600" />
                  <span>St. Charles Community College</span>
                </div>
                <div className="flex items-center gap-3 text-orange-900/70">
                  <Calendar className="w-5 h-5 text-orange-600" />
                  <span>Making your plate full since 2026</span>
                </div>
                <div className="flex items-center gap-3 text-orange-900/70">
                  <Mail className="w-5 h-5 text-orange-600" />
                  <span>team.leader@email.com</span>
                </div>
              </div>

              <div className="pt-4">
                <button className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-lg transition-colors flex items-center justify-center gap-2">
                  <Mail className="w-5 h-5" />
                  Contact Us
                </button>
              </div>
            </div>
          </div>

          {/* Bio Section */}
          <div className="border-t-2 border-orange-900/20 pt-8">
            <h3 className="text-2xl text-orange-900 mb-4">Our Story</h3>
            <div className="space-y-4 text-orange-900/70 leading-relaxed">
              <p>
                Welcome to Grandma's Cookbook! Our Team created this project in hopes of continuing traditions from one family to another.
              </p>
              <p>
                Our Team worked hard for not only for others but for our own use as well. We wanted to create a website that can store your delicious family recipes while also keeping them safe. Our Team uses this website for personal use as well to optimize the user experience. We came up with this idea as a team since most of us enjoy cooking and want to enjoy our family recipes without worrying about damaging or losing the original copy.
              </p>
              <p>
                Through Grandma's Cookbook, we hope to keep family traditions alive and keep plates full! Thank you for checking our team's site and hope you enjoy!
              </p>
            </div>
          </div>

          {/* Expertise Section */}
          <div className="border-t-2 border-orange-900/20 pt-8 mt-8">
            <h3 className="text-2xl text-orange-900 mb-6">Check out our Recommendations!</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div className="border-2 border-orange-900/20 rounded-lg px-3 py-2 text-center bg-orange-50 hover:border-orange-600 transition-colors">
                <p className="text-sm text-orange-900">Recommendation One</p>
              </div>
              <div className="border-2 border-orange-900/20 rounded-lg px-3 py-2 text-center bg-orange-50 hover:border-orange-600 transition-colors">
                <p className="text-sm text-orange-900">Recommendation Two</p>
              </div>
              <div className="border-2 border-orange-900/20 rounded-lg px-3 py-2 text-center bg-orange-50 hover:border-orange-600 transition-colors">
                <p className="text-sm text-orange-900">Recommendation Three</p>
              </div>
              <div className="border-2 border-orange-900/20 rounded-lg px-3 py-2 text-center bg-orange-50 hover:border-orange-600 transition-colors">
                <p className="text-sm text-orange-900">Recommendation Four</p>
              </div>
              <div className="border-2 border-orange-900/20 rounded-lg px-3 py-2 text-center bg-orange-50 hover:border-orange-600 transition-colors">
                <p className="text-sm text-orange-900">Recommendation<br />Five</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}