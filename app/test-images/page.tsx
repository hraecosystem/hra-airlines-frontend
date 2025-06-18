"use client";

import React from "react";
import Image from "next/image";

export default function TestImagesPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-8">Test des Images d'Hôtels</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Villa Manos Santorini */}
        <div className="bg-white rounded-lg p-6 shadow-md">
          <h2 className="text-xl font-bold mb-4">Villa Manos Santorini</h2>
          <div className="relative h-64 mb-4">
            <Image
              src="/hotel1.jpeg"
              alt="Villa Manos Santorini"
              fill
              className="object-cover rounded-lg"
              onError={(e) => {
                console.error("Erreur image hotel1.jpeg");
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  parent.innerHTML = '<div class="w-full h-full bg-red-200 flex items-center justify-center"><span class="text-red-600">Erreur: hotel1.jpeg</span></div>';
                }
              }}
              onLoad={() => console.log("Image hotel1.jpeg chargée avec succès")}
            />
          </div>
          <p className="text-sm text-gray-600">Chemin: /hotel1.jpeg</p>
        </div>

        {/* Apanemo Hotel */}
        <div className="bg-white rounded-lg p-6 shadow-md">
          <h2 className="text-xl font-bold mb-4">Apanemo Hotel & Suites</h2>
          <div className="relative h-64 mb-4">
            <Image
              src="/hotel2.jpeg"
              alt="Apanemo Hotel & Suites"
              fill
              className="object-cover rounded-lg"
              onError={(e) => {
                console.error("Erreur image hotel2.jpeg");
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  parent.innerHTML = '<div class="w-full h-full bg-red-200 flex items-center justify-center"><span class="text-red-600">Erreur: hotel2.jpeg</span></div>';
                }
              }}
              onLoad={() => console.log("Image hotel2.jpeg chargée avec succès")}
            />
          </div>
          <p className="text-sm text-gray-600">Chemin: /hotel2.jpeg</p>
        </div>
      </div>

      <div className="mt-8 bg-white rounded-lg p-6 shadow-md">
        <h3 className="text-lg font-bold mb-4">Instructions de test :</h3>
        <ol className="list-decimal list-inside space-y-2 text-gray-700">
          <li>Ouvrez la console du navigateur (F12)</li>
          <li>Regardez les messages de succès ou d'erreur</li>
          <li>Si vous voyez des erreurs, vérifiez que les images sont dans le dossier public/</li>
          <li>Essayez d'accéder directement à <a href="/hotel1.jpeg" target="_blank" className="text-blue-600 hover:underline">/hotel1.jpeg</a> et <a href="/hotel2.jpeg" target="_blank" className="text-blue-600 hover:underline">/hotel2.jpeg</a></li>
        </ol>
      </div>
    </div>
  );
} 