  async function insertFeatures(features) {
    try {
      const transformedFeatures = features.map((feature) => ({
        type: feature.type,
        geometry: feature.geometry,
        properties: feature.properties,
      }));

      const { data: checkDatabase, error: checkError } = await supabase
        .from("trabuom_duplicate")
        .select("*");

      if (checkError) {
        console.log(checkError);
        return;
      }
      if (checkDatabase.length === 0) {
        // Insert the transformed features into the 'trabuom' table
        const { data, error } = await supabase
          .from("trabuom_duplicate")
          .insert(transformedFeatures)
          .select("*");

        console.log(data);
        if (error) {
          console.error("Error inserting features:", error);
        } else {
          console.log("Inserted features:", data);
        }
      }
    } catch (err) {
      console.error("Error:", err);
    }
  }

  useEffect(() => {
    //insertFeatures(trabuomFeatures);
  }, [])