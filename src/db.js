import Dexie from 'dexie';

export const db = new Dexie('JobTrackerDB');

db.version(1).stores({
  jobs: '++id, company, role, status, workType, date',
});

// Migrate: add places table in v2
db.version(2).stores({
  jobs: '++id, company, role, status, workType, date',
  places: '++id, &name',
});

/* ---- Job helpers ---- */
export const addJob = async (job) => {
  const id = await db.jobs.add(job);
  // auto-save place if not empty
  if (job.place && job.place.trim()) {
    await savePlace(job.place.trim());
  }
  return id;
};

export const updateJob = async (id, changes) => {
  await db.jobs.update(id, changes);
  if (changes.place && changes.place.trim()) {
    await savePlace(changes.place.trim());
  }
};

export const deleteJob = (id) => db.jobs.delete(id);
export const getJob = (id) => db.jobs.get(id);

/* ---- Place helpers ---- */
export const savePlace = async (name) => {
  const exists = await db.places.where('name').equalsIgnoreCase(name).first();
  if (!exists) {
    await db.places.add({ name });
  }
};

export const getAllPlaces = () => db.places.orderBy('name').toArray();
