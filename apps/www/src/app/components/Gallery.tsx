import { motion, useInView } from 'motion/react';
import { useRef } from 'react';

export default function Gallery() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  // Placeholder images - in production, these would be real student photos
  const galleryItems = [
    { id: 1, aspect: 'tall' },
    { id: 2, aspect: 'wide' },
    { id: 3, aspect: 'square' },
    { id: 4, aspect: 'tall' },
    { id: 5, aspect: 'square' },
    { id: 6, aspect: 'wide' }
  ];

  return (
    <section 
      id="gallery" 
      ref={ref}
      style={{
        background: 'linear-gradient(180deg, rgba(243, 235, 209, 0.3) 0%, #ffffff 100%)'
      }}
      className="relative py-24 md:py-32 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-['Neutraface_2_Text:Bold',sans-serif] text-[#09090F] mb-6">
            ÖĞRENCİ ANILARI
          </h2>
          <p className="text-lg md:text-xl text-[#484848] max-w-3xl mx-auto font-['Neutraface_2_Text:Book',sans-serif]">
            Teachera ailesinin mutlu anları
          </p>
        </motion.div>

        {/* Masonry Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {galleryItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.05, zIndex: 10 }}
              className={`relative group cursor-pointer rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all ${
                item.aspect === 'tall' ? 'row-span-2' : 
                item.aspect === 'wide' ? 'col-span-2' : 
                'aspect-square'
              }`}
            >
              {/* Placeholder gradient */}
              <div 
                className={`w-full ${item.aspect === 'tall' ? 'h-full' : item.aspect === 'wide' ? 'aspect-[2/1]' : 'aspect-square'}`}
                style={{
                  background: index % 3 === 0 
                    ? 'linear-gradient(135deg, rgba(229, 30, 37, 0.2) 0%, rgba(51, 78, 72, 0.2) 100%)'
                    : index % 3 === 1 
                    ? 'linear-gradient(135deg, rgba(51, 78, 72, 0.2) 0%, #F3EBD1 100%)'
                    : 'linear-gradient(135deg, #F3EBD1 0%, rgba(229, 30, 37, 0.2) 100%)'
                }}
              />

              {/* Overlay on hover */}
              <motion.div
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                style={{
                  background: 'linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.6) 100%)'
                }}
                className="absolute inset-0 flex items-end p-6"
              >
                <div className="text-[#ffffff]">
                  <p className="font-['Neutraface_2_Text:Demi',sans-serif] text-lg mb-1">
                    Öğrenci Anısı {item.id}
                  </p>
                  <p className="font-['Neutraface_2_Text:Book',sans-serif] text-sm opacity-90">
                    Teachera ile öğrenme serüveni
                  </p>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-16"
        >
          <p className="text-[#484848] font-['Neutraface_2_Text:Book',sans-serif] mb-6">
            Siz de bu ailenin bir parçası olmak ister misiniz?
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-[#E51E25] text-[#ffffff] rounded-full font-['Neutraface_2_Text:Demi',sans-serif] hover:bg-[#c41920] transition-colors shadow-lg hover:shadow-xl hover:shadow-[#E51E25]/30"
          >
            Hemen Başla
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
