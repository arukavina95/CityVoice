// CityVoice/DTOs/NoteDto.cs
using System;

namespace CityVoice.DTOs
{
    public class NoteDto
    {
        public int Id { get; set; }
        public string Content { get; set; }
        public DateTime CreatedAt { get; set; }
        public string Username { get; set; } // Ime korisnika koji je dodao bilješku
    }
}